

from fastapi import APIRouter, Depends

from ...core.jwt import get_current_user
from ...db.models.user import User
from ...db.schemas.user import UserPublic

router = APIRouter(prefix="/users")

@router.get("/ping")
async def ping():
    return {"users": "ok"}

@router.get("/me", response_model=UserPublic)
async def me(current_user: User = Depends(get_current_user)):
    return current_user