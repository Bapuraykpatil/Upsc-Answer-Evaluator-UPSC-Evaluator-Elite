from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class EvaluationPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    submission_id: int
    overall_score: float
    feedback: dict