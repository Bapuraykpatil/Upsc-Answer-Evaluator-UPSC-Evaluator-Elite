from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class SubmissionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    question_id: int
    typed_text: str | None
    handwritten_file_path: str | None
    ocr_text: str | None
    status: str