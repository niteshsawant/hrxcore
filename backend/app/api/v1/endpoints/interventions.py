from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.models.intervention import Intervention, Stage, ExecutionStep
from backend.app.schemas.intervention import (
    InterventionCreate,
    Intervention as InterventionSchema,
    InterventionUpdate,
    StageCreate,
    Stage as StageSchema,
    ExecutionStepCreate,
    ExecutionStep as ExecutionStepSchema
)

router = APIRouter()

# --- Interventions ---

@router.post("/", response_model=InterventionSchema)
def create_intervention(intervention: InterventionCreate, db: Session = Depends(get_db)):
    db_intervention = Intervention(**intervention.dict())
    
    # If phases are auto-generated later, we might need logic here.
    # But currently phases are added separately via POST /phases.
    # So when adding phases, we need to respect the order and default status.
    
    db.add(db_intervention)
    db.commit()
    db.refresh(db_intervention)
    return db_intervention

@router.get("/", response_model=List[InterventionSchema])
def read_interventions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    interventions = db.query(Intervention).offset(skip).limit(limit).all()
    return interventions

@router.get("/{intervention_id}", response_model=InterventionSchema)
def read_intervention(intervention_id: int, db: Session = Depends(get_db)):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
    return intervention

@router.put("/{intervention_id}", response_model=InterventionSchema)
def update_intervention(intervention_id: int, intervention: InterventionUpdate, db: Session = Depends(get_db)):
    db_intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if db_intervention is None:
        raise HTTPException(status_code=404, detail="Intervention not found")
    
    update_data = intervention.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_intervention, key, value)
    
    db.commit()
    db.refresh(db_intervention)
    return db_intervention

@router.delete("/{intervention_id}", response_model=InterventionSchema)
def delete_intervention(intervention_id: int, db: Session = Depends(get_db)):
    db_intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not db_intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
    db.delete(db_intervention)
    db.commit()
    return db_intervention

# --- Stages & ExecutionSteps ---

@router.post("/{intervention_id}/stages", response_model=StageSchema)
def create_stage(intervention_id: int, stage: StageCreate, db: Session = Depends(get_db)):
    # Verify intervention
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    # Create Stage
    # We need to handle execution_steps separately if they are passed in StageCreate
    stage_data = stage.dict(exclude={"execution_steps"})
    db_stage = Stage(
        intervention_id=intervention_id,
        **stage_data
    )
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)

    # Create ExecutionSteps
    if stage.execution_steps:
        for step_data in stage.execution_steps:
            db_step = ExecutionStep(
                stage_id=db_stage.id,
                **step_data.dict()
            )
            db.add(db_step)
        db.commit()
        db.refresh(db_stage) # Refresh to get sub-items
    
    return db_stage

@router.get("/{intervention_id}/stages", response_model=List[StageSchema])
def read_stages(intervention_id: int, db: Session = Depends(get_db)):
    stages = db.query(Stage).filter(Stage.intervention_id == intervention_id).order_by(Stage.order).all()
    return stages

# --- ExecutionSteps ---

@router.post("/stages/{stage_id}/execution_steps", response_model=ExecutionStepSchema)
def create_execution_step(stage_id: int, step: ExecutionStepCreate, db: Session = Depends(get_db)):
    db_stage = db.query(Stage).filter(Stage.id == stage_id).first()
    if not db_stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    db_step = ExecutionStep(**step.dict(), stage_id=stage_id)
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    return db_step
