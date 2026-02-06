from __future__ import annotations

import os
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...config import settings
from ...core.jwt import get_current_user
from ...database import get_db
from ...db.models.submission import Submission
from ...db.models.user import User
from ...db.schemas.submission import SubmissionPublic
from ...services.submission_service import create_submission

router = APIRouter(prefix="/submissions")


@router.get("/ping")
async def ping():
    return {"submissions": "ok"}


@router.post("", response_model=SubmissionPublic)
async def submit_answer(
    question_id: int = Form(...),
    typed_text: str | None = Form(None),
    handwritten: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    handwritten_path = None

    if handwritten is not None:
        os.makedirs(settings.STORAGE_DIR, exist_ok=True)

        ext = os.path.splitext(handwritten.filename or "")[1].lower() or ".bin"
        fname = f"{uuid.uuid4().hex}{ext}"
        handwritten_path = os.path.join(settings.STORAGE_DIR, fname)

        with open(handwritten_path, "wb") as f:
            f.write(await handwritten.read())

    sub = await create_submission(
        db,
        user_id=current_user.id,
        question_id=question_id,
        typed_text=typed_text,
        handwritten_file_path=handwritten_path,
    )
    return sub


@router.get("/mine", response_model=list[SubmissionPublic])
async def my_submissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(Submission)
        .where(Submission.user_id == current_user.id)
        .order_by(Submission.id.desc())
    )
    return list(res.scalars().all())