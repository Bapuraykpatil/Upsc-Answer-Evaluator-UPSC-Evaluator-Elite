from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models.submission import Submission


async def create_submission(
    db: AsyncSession,
    *,
    user_id: int,
    question_id: int,
    typed_text: str | None,
    handwritten_file_path: str | None,
) -> Submission:
    sub = Submission(
        user_id=user_id,
        question_id=question_id,
        typed_text=typed_text,
        handwritten_file_path=handwritten_file_path,
        status="submitted",
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub