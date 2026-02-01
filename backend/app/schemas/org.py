from pydantic import BaseModel
from datetime import datetime

class OrganizationCreate(BaseModel):
    name: str
    industry: str
    size: str

class OrganizationResponse(OrganizationCreate):
    id: str
    created_at: datetime
