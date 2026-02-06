from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.jwt import get_current_user
from ...database import get_db
from ...db.models.user import User
from ...db.schemas.evaluation import EvaluationPublic
from ...services.evaluation_service import evaluate_submission

router = APIRouter(prefix="/evaluations")

@router.get("/ping")
async def ping():
    return {"evaluations": "ok"}

@router.post("/{submission_id}", response_model=EvaluationPublic)
async def run_evaluation(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    try:
        return await evaluate_submission(db, submission_id=submission_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))