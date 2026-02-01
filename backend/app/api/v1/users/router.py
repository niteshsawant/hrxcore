from fastapi import APIRouter, Query
from uuid import UUID

from backend.app.schemas.user import UserCreate, UserResponse
from backend.app.services.user_store import create_user, list_users

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=UserResponse)
def create_user_api(payload: UserCreate):
    return create_user(payload.dict())

@router.get("/", response_model=list[UserResponse])
def list_users_api(org_id: UUID | None = Query(default=None)):
    return list_users(org_id)
