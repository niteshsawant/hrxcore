from fastapi import APIRouter
from ...schemas.chro_snapshot import CHROSnapshotResponse
from ...services.chro_snapshot_service import generate_chro_snapshot

router = APIRouter(
    prefix="/orgs",
    tags=["CHRO Thinking Simulator"]
)

@router.get(
    "/{org_id}/chro-snapshot",
    response_model=CHROSnapshotResponse
)
def get_chro_snapshot(org_id: str):
    return generate_chro_snapshot(org_id)
