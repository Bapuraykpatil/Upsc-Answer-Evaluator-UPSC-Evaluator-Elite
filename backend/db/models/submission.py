from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), index=True, nullable=False)

    typed_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    handwritten_file_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    ocr_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(String(50), default="submitted", nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="submissions")
    question = relationship("Question", back_populates="submissions")

    evaluation = relationship("Evaluation", back_populates="submission", uselist=False, cascade="all, delete-orphan")
    visuals = relationship("Visual", back_populates="submission", cascade="all, delete-orphan")
    