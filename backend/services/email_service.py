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

from ..config import settings


async def send_otp_email(to_email: str, otp: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = "Your UPSC Evaluator OTP"

    msg.set_content(
        f"Your OTP is: {otp}\n\n"
        f"It expires in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
        f"If you didn’t request this, ignore this email."
    )

    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        start_tls=True,
    )