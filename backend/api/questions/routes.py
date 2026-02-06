from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.jwt import get_current_user
from ...database import get_db
from ...db.models.question import Question
from ...db.models.user import User
from ...db.schemas.question import QuestionCreate, QuestionPublic

router = APIRouter(prefix="/questions")

@router.get("/ping")
async def ping():
    return {"questions": "ok"}

@router.post("", response_model=QuestionPublic)
async def create_question(
    payload: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = Question(title=payload.title, prompt=payload.prompt, max_marks=payload.max_marks)
    db.add(q)
    await db.commit()
    await db.refresh(q)
    return q

@router.get("", response_model=list[QuestionPublic])
async def list_questions(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Question).order_by(Question.id.desc()))
    return list(res.scalars().all())