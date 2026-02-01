from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    full_name: str
    org_id: UUID

class UserResponse(UserCreate):
    id: UUID
    created_at: datetime
