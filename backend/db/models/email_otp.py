# from __future__ import annotations

# from datetime import datetime

# from sqlalchemy import DateTime, ForeignKey, Integer, String, func
# from sqlalchemy.orm import Mapped, mapped_column

# from ...database import Base


# class EmailOTP(Base):
#     __tablename__ = "email_otps"

#     id: Mapped[int] = mapped_column(primary_key=True)
#     user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

#     purpose: Mapped[str] = mapped_column(String(30), default="verify_email", nullable=False)

#     otp_hash: Mapped[str] = mapped_column(String(128), nullable=False)
#     expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

#     attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
#     created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ...database import Base


class EmailOTP(Base):
    __tablename__ = "email_otps"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    purpose: Mapped[str] = mapped_column(String(30), default="verify_email", nullable=False)

    otp_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
