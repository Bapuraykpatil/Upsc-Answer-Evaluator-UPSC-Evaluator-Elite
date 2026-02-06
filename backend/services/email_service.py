# from __future__ import annotations

# import aiosmtplib
# from email.message import EmailMessage

# from ..config import settings


# async def send_otp_email(to_email: str, otp: str) -> None:
#     msg = EmailMessage()
#     msg["From"] = settings.SMTP_FROM
#     msg["To"] = to_email
#     msg["Subject"] = "Your UPSC Evaluator OTP"

#     msg.set_content(
#         f"Your OTP is: {otp}\n\n"
#         f"It expires in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
#         f"If you didn't request this, ignore this email."
#     )

#     await aiosmtplib.send(
#         msg,
#         hostname=settings.SMTP_HOST,
#         port=settings.SMTP_PORT,
#         username=settings.SMTP_USER,
#         password=settings.SMTP_PASSWORD,
#         start_tls=True,
#     )
from email.message import EmailMessage

import aiosmtplib
import httpx

from ..config import settings


async def _send_via_sendgrid(to_email: str, otp: str) -> None:
    from_email = settings.SENDGRID_FROM or settings.SMTP_FROM
    if not settings.SENDGRID_API_KEY:
        raise RuntimeError("SENDGRID_API_KEY is not set")

    payload = {
        "personalizations": [{"to": [{"email": to_email}]}],
        "from": {"email": from_email},
        "subject": "Your UPSC Evaluator OTP",
        "content": [
            {
                "type": "text/plain",
                "value": (
                    f"Your OTP is: {otp}\n\n"
                    f"It expires in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
                    "If you didn't request this, ignore this email."
                ),
            }
        ],
    }

    headers = {
        "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            "https://api.sendgrid.com/v3/mail/send", json=payload, headers=headers
        )
        if resp.status_code >= 400:
            raise RuntimeError(f"SendGrid error {resp.status_code}: {resp.text}")


async def _send_via_smtp(to_email: str, otp: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = "Your UPSC Evaluator OTP"

    msg.set_content(
        f"Your OTP is: {otp}\n\n"
        f"It expires in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
        "If you didn't request this, ignore this email."
    )

    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )


async def send_otp_email(to_email: str, otp: str) -> None:
    if settings.SENDGRID_API_KEY:
        await _send_via_sendgrid(to_email, otp)
        return
    await _send_via_smtp(to_email, otp)
