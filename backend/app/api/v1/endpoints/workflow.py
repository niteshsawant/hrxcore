from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.services.workflow import WorkflowService
from backend.app.schemas.intervention import Stage as StageSchema

router = APIRouter()

@router.post("/{stage_id}/start", response_model=StageSchema)
def start_stage(stage_id: int, user_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    return WorkflowService.start_stage(db, stage_id, user_id)

@router.post("/{stage_id}/submit", response_model=StageSchema)
def submit_stage(stage_id: int, user_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    return WorkflowService.submit_stage(db, stage_id, user_id)

@router.post("/{stage_id}/review", response_model=StageSchema)
def review_stage(stage_id: int, mentor_id: int = Body(..., embed=True), action: str = Body(..., embed=True), feedback: str = Body(None, embed=True), rating: int = Body(None, embed=True), db: Session = Depends(get_db)):
    return WorkflowService.review_stage(db, stage_id, mentor_id, action, feedback, rating)
    
@router.post("/{stage_id}/resume", response_model=StageSchema)
def resume_stage(stage_id: int, user_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    return WorkflowService.resume_stage(db, stage_id, user_id)

@router.post("/{stage_id}/add-link", response_model=StageSchema)
def add_evidence_link(stage_id: int, link: str = Body(..., embed=True), user_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    return WorkflowService.add_evidence(db, stage_id, link, user_id)
