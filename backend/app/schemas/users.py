from fastapi import APIRouter
from datetime import datetime
import uuid

from backend.app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

# Temporary in-memory store
USER_STORE = {}

@router.post("", response_model=UserResponse)
def create_user(payload: UserCreate):
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": payload.email,
        "full_name": payload.full_name,
        "role": payload.role,
        "org_id": payload.org_id,
        "created_at": datetime.utcnow(),
    }
    USER_STORE[user_id] = user
    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    return USER_STORE.get(user_id)

@router.get("/org/{org_id}", response_model=list[UserResponse])
def list_users_by_org(org_id: str):
    return [
        user for user in USER_STORE.values()
        if user["org_id"] == org_id
    ]
