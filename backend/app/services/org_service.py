from uuid import uuid4
from datetime import datetime, timezone
from app.schemas.org import OrganizationCreate

def create_org(data: OrganizationCreate):
    return {
        "id": str(uuid4()),
        "name": data.name,
        "industry": data.industry,
        "size": data.size,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

def get_org(org_id: str):
    return {
        "id": org_id,
        "name": "HRGurukul",
        "industry": "HR Consulting",
        "size": "11-50",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
