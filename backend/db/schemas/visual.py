from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class VisualPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    submission_id: int
    visual_type: str
    confidence: float
    bbox: dict
    extracted_labels: str | None
    feedback: str | None