import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...config import settings
from ...core.jwt import create_access_token
from ...core.security import get_password_hash, verify_password
from ...database import get_db
from ...db.models.email_otp import EmailOTP
from ...db.models.pending_otp import PendingOTP
from ...db.models.pending_registration import PendingRegistration
from ...db.models.user import User
from ...db.schemas.otp import VerifyOTPRequest
from ...services.email_service import send_otp_email

router = APIRouter(prefix="/auth")


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ResendOTPRequest(BaseModel):
    email: EmailStr
    flow: str  # "register" or "login"


class TestEmailRequest(BaseModel):
    email: EmailStr


def _hash_otp(otp: str) -> str:
    # OTP hash bound to SECRET_KEY so leaked DB doesn't reveal OTP
    return hashlib.sha256((otp + settings.SECRET_KEY).encode("utf-8")).hexdigest()


@router.get("/ping")
async def ping():
    return {"auth": "ok"}


@router.post("/test-email")
async def test_email(payload: TestEmailRequest):
    """
    Sends a test OTP email to verify SMTP configuration.
    """
    otp = f"{secrets.randbelow(1_000_000):06d}"
    try:
        await send_otp_email(payload.email, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OTP email failed: {e}")
    return {"status": "sent", "email": payload.email}


@router.post("/register")
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Registration:
    - store pending registration
    - send OTP
    - DO NOT create user yet
    """
    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalar_one_or_none()
    if user:
        raise HTTPException(status_code=409, detail="Account already exists")

    res = await db.execute(
        select(PendingRegistration).where(PendingRegistration.email == payload.email)
    )
    pending = res.scalar_one_or_none()
    if pending is None:
        pending = PendingRegistration(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=get_password_hash(payload.password),
        )
        db.add(pending)
        await db.commit()
        await db.refresh(pending)
    else:
        pending.full_name = payload.full_name
        pending.hashed_password = get_password_hash(payload.password)
        await db.commit()

    otp = f"{secrets.randbelow(1_000_000):06d}"
    otp_hash = _hash_otp(otp)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    # Resend cooldown guard
    res = await db.execute(
        select(PendingOTP)
        .where(PendingOTP.pending_registration_id == pending.id)
        .order_by(PendingOTP.id.desc())
    )
    existing_otp = res.scalar_one_or_none()
    if existing_otp:
        created_at = existing_otp.created_at
        if created_at:
            created_at = created_at.replace(tzinfo=None)
            cooldown_until = created_at + timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)
            if datetime.utcnow() < cooldown_until:
                seconds_left = int((cooldown_until - datetime.utcnow()).total_seconds())
                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {seconds_left} seconds before resending OTP.",
                )

    await db.execute(
        delete(PendingOTP).where(PendingOTP.pending_registration_id == pending.id)
    )
    db.add(
        PendingOTP(
            pending_registration_id=pending.id,
            otp_hash=otp_hash,
            expires_at=expires_at,
        )
    )
    await db.commit()

    try:
        await send_otp_email(pending.email, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OTP email failed: {e}")

    response = {"status": "otp_sent", "email": pending.email}
    if settings.OTP_DEBUG_ECHO:
        response["otp"] = otp
    return response


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify OTP for registration or login.
    """
    if payload.flow == "register":
        res = await db.execute(
            select(PendingRegistration).where(PendingRegistration.email == payload.email)
        )
        pending = res.scalar_one_or_none()
        if not pending:
            raise HTTPException(status_code=404, detail="Pending registration not found")

        res = await db.execute(
            select(PendingOTP)
            .where(PendingOTP.pending_registration_id == pending.id)
            .order_by(PendingOTP.id.desc())
        )
        rec = res.scalar_one_or_none()
        if not rec:
            raise HTTPException(status_code=400, detail="OTP not requested")

        expires_at = rec.expires_at.replace(tzinfo=None)
        if datetime.utcnow() > expires_at:
            raise HTTPException(status_code=400, detail="OTP expired")

        if rec.attempts >= settings.OTP_MAX_ATTEMPTS:
            await db.execute(
                delete(PendingOTP).where(PendingOTP.pending_registration_id == pending.id)
            )
            await db.execute(delete(PendingRegistration).where(PendingRegistration.id == pending.id))
            await db.commit()
            raise HTTPException(
                status_code=403, detail="Too many invalid attempts. Please register again."
            )

        if _hash_otp(payload.otp) != rec.otp_hash:
            rec.attempts += 1
            await db.commit()
            remaining = settings.OTP_MAX_ATTEMPTS - rec.attempts
            raise HTTPException(
                status_code=400, detail=f"Invalid OTP. {remaining} attempts remaining."
            )

        user = User(
            email=pending.email,
            hashed_password=pending.hashed_password,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.commit()

        await db.execute(
            delete(PendingOTP).where(PendingOTP.pending_registration_id == pending.id)
        )
        await db.execute(delete(PendingRegistration).where(PendingRegistration.id == pending.id))
        await db.commit()

        token = create_access_token(subject=str(user.id))
        return {"status": "registered", "access_token": token, "token_type": "bearer"}

    if payload.flow == "login":
        res = await db.execute(select(User).where(User.email == payload.email))
        user = res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        res = await db.execute(
            select(EmailOTP)
            .where(EmailOTP.user_id == user.id)
            .where(EmailOTP.purpose == "login")
            .order_by(EmailOTP.id.desc())
        )
        rec = res.scalar_one_or_none()
        if not rec:
            raise HTTPException(status_code=400, detail="OTP not requested")

        expires_at = rec.expires_at.replace(tzinfo=None)
        if datetime.utcnow() > expires_at:
            raise HTTPException(status_code=400, detail="OTP expired")

        if rec.attempts >= settings.OTP_MAX_ATTEMPTS:
            await db.execute(delete(EmailOTP).where(EmailOTP.user_id == user.id))
            await db.commit()
            raise HTTPException(
                status_code=403, detail="Too many invalid attempts. Please login again."
            )

        if _hash_otp(payload.otp) != rec.otp_hash:
            rec.attempts += 1
            await db.commit()
            remaining = settings.OTP_MAX_ATTEMPTS - rec.attempts
            raise HTTPException(
                status_code=400, detail=f"Invalid OTP. {remaining} attempts remaining."
            )

        await db.execute(delete(EmailOTP).where(EmailOTP.user_id == user.id))
        await db.commit()

        token = create_access_token(subject=str(user.id))
        return {"status": "login_success", "access_token": token, "token_type": "bearer"}

    raise HTTPException(status_code=400, detail="Invalid flow")


@router.post("/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Login step 1: verify credentials, then send OTP.
    """
    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify OTP.")

    res = await db.execute(
        select(EmailOTP)
        .where(EmailOTP.user_id == user.id)
        .where(EmailOTP.purpose == "login")
        .order_by(EmailOTP.id.desc())
    )
    existing_otp = res.scalar_one_or_none()
    if existing_otp:
        created_at = existing_otp.created_at
        if created_at:
            created_at = created_at.replace(tzinfo=None)
            cooldown_until = created_at + timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)
            if datetime.utcnow() < cooldown_until:
                seconds_left = int((cooldown_until - datetime.utcnow()).total_seconds())
                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {seconds_left} seconds before resending OTP.",
                )

    otp = f"{secrets.randbelow(1_000_000):06d}"
    otp_hash = _hash_otp(otp)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    await db.execute(delete(EmailOTP).where(EmailOTP.user_id == user.id))
    db.add(EmailOTP(user_id=user.id, otp_hash=otp_hash, expires_at=expires_at, purpose="login"))
    await db.commit()

    try:
        await send_otp_email(user.email, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OTP email failed: {e}")

    response = {"status": "otp_required"}
    if settings.OTP_DEBUG_ECHO:
        response["otp"] = otp
    return response


@router.post("/resend-otp")
async def resend_otp(payload: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    if payload.flow == "register":
        res = await db.execute(
            select(PendingRegistration).where(PendingRegistration.email == payload.email)
        )
        pending = res.scalar_one_or_none()
        if not pending:
            raise HTTPException(status_code=404, detail="Pending registration not found")

        res = await db.execute(
            select(PendingOTP)
            .where(PendingOTP.pending_registration_id == pending.id)
            .order_by(PendingOTP.id.desc())
        )
        existing_otp = res.scalar_one_or_none()
        if existing_otp:
            created_at = existing_otp.created_at
            if created_at:
                created_at = created_at.replace(tzinfo=None)
                cooldown_until = created_at + timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)
                if datetime.utcnow() < cooldown_until:
                    seconds_left = int((cooldown_until - datetime.utcnow()).total_seconds())
                    raise HTTPException(
                        status_code=429,
                        detail=f"Please wait {seconds_left} seconds before resending OTP.",
                    )

        otp = f"{secrets.randbelow(1_000_000):06d}"
        otp_hash = _hash_otp(otp)
        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        await db.execute(
            delete(PendingOTP).where(PendingOTP.pending_registration_id == pending.id)
        )
        db.add(
            PendingOTP(
                pending_registration_id=pending.id,
                otp_hash=otp_hash,
                expires_at=expires_at,
            )
        )
        await db.commit()

        try:
            await send_otp_email(pending.email, otp)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OTP email failed: {e}")

        response = {"message": "OTP resent. Please verify."}
        if settings.OTP_DEBUG_ECHO:
            response["otp"] = otp
        return response

    if payload.flow == "login":
        res = await db.execute(select(User).where(User.email == payload.email))
        user = res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not user.is_verified:
            raise HTTPException(status_code=403, detail="Email not verified")

        res = await db.execute(
            select(EmailOTP)
            .where(EmailOTP.user_id == user.id)
            .where(EmailOTP.purpose == "login")
            .order_by(EmailOTP.id.desc())
        )
        existing_otp = res.scalar_one_or_none()
        if existing_otp:
            created_at = existing_otp.created_at
            if created_at:
                created_at = created_at.replace(tzinfo=None)
                cooldown_until = created_at + timedelta(seconds=settings.OTP_RESEND_COOLDOWN_SECONDS)
                if datetime.utcnow() < cooldown_until:
                    seconds_left = int((cooldown_until - datetime.utcnow()).total_seconds())
                    raise HTTPException(
                        status_code=429,
                        detail=f"Please wait {seconds_left} seconds before resending OTP.",
                    )

        otp = f"{secrets.randbelow(1_000_000):06d}"
        otp_hash = _hash_otp(otp)
        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        await db.execute(delete(EmailOTP).where(EmailOTP.user_id == user.id))
        db.add(
            EmailOTP(
                user_id=user.id,
                otp_hash=otp_hash,
                expires_at=expires_at,
                purpose="login",
            )
        )
        await db.commit()

        try:
            await send_otp_email(user.email, otp)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OTP email failed: {e}")

        response = {"message": "OTP resent. Please verify."}
        if settings.OTP_DEBUG_ECHO:
            response["otp"] = otp
        return response

    raise HTTPException(status_code=400, detail="Invalid flow")
