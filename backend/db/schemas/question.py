from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class QuestionCreate(BaseModel):
    title: str
    prompt: str
    max_marks: int = 10


class QuestionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    prompt: str
    max_marks: int