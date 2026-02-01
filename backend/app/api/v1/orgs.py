from fastapi import APIRouter
from datetime import datetime
import uuid

from backend.app.schemas.org import OrganizationCreate, OrganizationResponse

router = APIRouter(prefix="/orgs", tags=["organizations"])

# Temporary in-memory store
ORG_STORE = {}

@router.post("", response_model=OrganizationResponse)
def create_org(payload: OrganizationCreate):
    org_id = str(uuid.uuid4())
    org = {
        "id": org_id,
        "name": payload.name,
        "industry": payload.industry,
        "size": payload.size,
        "created_at": datetime.utcnow(),
    }
    ORG_STORE[org_id] = org
    return org

@router.get("/{org_id}", response_model=OrganizationResponse)
def get_org(org_id: str):
    return ORG_STORE.get(org_id)
