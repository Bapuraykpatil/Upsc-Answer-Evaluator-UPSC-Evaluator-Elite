from __future__ import annotations

from sqlalchemy import Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...database import Base


class Visual(Base):
    __tablename__ = "visuals"

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.id"), index=True, nullable=False)

    visual_type: Mapped[str] = mapped_column(String(50), default="unknown", nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    bbox: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    extracted_labels: Mapped[str | None] = mapped_column(Text, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)

    submission = relationship("Submission", back_populates="visuals")