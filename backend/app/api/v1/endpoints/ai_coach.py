from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.core.db import get_db
from backend.app.models.user import User
from backend.app.models.intervention import ExecutionStep
from backend.app.services.ai_coach import get_step_guidance, get_step_feedback

# TODO: Add authentication dependency once user Auth is fully integrated in router
# For now passing user_id manually or assuming a default test user if auth not present
# But based on previous files, we can use a dummy dependency or just pass user_id in body for feedback?
# The prompt says "Add AIInteraction logging per call", so we need user_id.
# I will assume we can get user_id from the request or use a hardcoded one for now if Auth isn't strict.
# Actually, `users.py` has `read_users`, so users exist.
# I'll add a simple dependency to get the current user, or just accept user_id in the request for simplicity
# as I don't have the full Auth middleware visible here (it was in `dashboard/page.tsx` on client side).
# Wait, `router.py` has `users`, `interventions`.
# taking a shortcut: accepting `user_id` in query or body for now to keep it functional.

router = APIRouter()

class FeedbackRequest(BaseModel):
    user_id: int
    notes: str

class AIResponse(BaseModel):
    response: str

@router.get("/execution-steps/{step_id}/ai-guidance", response_model=AIResponse)
def get_guidance(step_id: int, user_id: int, db: Session = Depends(get_db)):
    step = db.query(ExecutionStep).filter(ExecutionStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Execution Step not found")
    
    response_text = get_step_guidance(db, step, user_id)
    return {"response": response_text}

@router.post("/execution-steps/{step_id}/ai-feedback", response_model=AIResponse)
def get_feedback(step_id: int, request: FeedbackRequest, db: Session = Depends(get_db)):
    step = db.query(ExecutionStep).filter(ExecutionStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Execution Step not found")
    
    response_text = get_step_feedback(db, step, request.notes, request.user_id)
    return {"response": response_text}
