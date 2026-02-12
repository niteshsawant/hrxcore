from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.app.models.intervention import Stage, StageStatus, Intervention
from backend.app.models.user import User
from datetime import datetime

class WorkflowService:
    @staticmethod
    def get_stage(db: Session, stage_id: int) -> Stage:
        stage = db.query(Stage).filter(Stage.id == stage_id).first()
        if not stage:
            raise HTTPException(status_code=404, detail="Stage not found")
        return stage

    @staticmethod
    def start_stage(db: Session, stage_id: int, user_id: int) -> Stage:
        stage = WorkflowService.get_stage(db, stage_id)
        
        # Rule: Only "locked" stages can be started
        # (Or first stage, or if previous approved)
        
        if stage.status != StageStatus.LOCKED.value:
             if stage.status == StageStatus.IN_PROGRESS.value:
                 return stage
             raise HTTPException(status_code=400, detail=f"Cannot start stage in status {stage.status}")

        # Check if previous stage is approved (unless it's the first one)
        if stage.order > 1:
            prev_stage = db.query(Stage).filter(
                Stage.intervention_id == stage.intervention_id,
                Stage.order == stage.order - 1
            ).first()
            if not prev_stage or prev_stage.status != StageStatus.APPROVED.value:
                raise HTTPException(status_code=400, detail="Previous stage must be approved before starting this stage")

        stage.status = StageStatus.IN_PROGRESS.value
        db.commit()
        db.refresh(stage)
        return stage

    @staticmethod
    def submit_stage(db: Session, stage_id: int, user_id: int) -> Stage:
        stage = WorkflowService.get_stage(db, stage_id)
        
        # Rule: Practitioner can submit only in in_progress state
        if stage.status != StageStatus.IN_PROGRESS.value:
             raise HTTPException(status_code=400, detail=f"Cannot submit stage in status {stage.status}")

        # Check for evidence links on the Stage
        if not stage.evidence_links:
            raise HTTPException(status_code=400, detail="Cannot submit stage without evidence links. Please add at least one evidence link first.")

        # Check authorization (practitioner only) -- omitted for now as user_id passed but not checked against intervention

        stage.status = StageStatus.SUBMITTED.value
        db.commit()
        db.refresh(stage)
        return stage

    @staticmethod
    def review_stage(db: Session, stage_id: int, mentor_id: int, action: str, feedback: str = None, rating: int = None) -> Stage:
        stage = WorkflowService.get_stage(db, stage_id)
        
        # Rule: Mentor can only review submitted stages
        if stage.status != StageStatus.SUBMITTED.value:
            raise HTTPException(status_code=400, detail=f"Cannot review stage in status {stage.status}")

        stage.reviewed_by = mentor_id
        stage.mentor_feedback = feedback
        stage.rating = rating

        if action == "approve":
            stage.status = StageStatus.APPROVED.value
            stage.approved_at = datetime.utcnow()
            
            # Unlock next stage? 
            # Logic: User will "start" next stage, which checks for this one being approved.
            
        elif action == "rework":
            stage.status = StageStatus.REWORK.value
        else:
            raise HTTPException(status_code=400, detail="Invalid review action")

        db.commit()
        db.refresh(stage)
        return stage
        
    @staticmethod
    def resume_stage(db: Session, stage_id: int, user_id: int) -> Stage:
        # To handle Rework -> In Progress
        stage = WorkflowService.get_stage(db, stage_id)
        if stage.status != StageStatus.REWORK.value:
             raise HTTPException(status_code=400, detail=f"Cannot resume stage from status {stage.status}")
        
        stage.status = StageStatus.IN_PROGRESS.value
        db.commit()
        db.refresh(stage)
        return stage
    
    @staticmethod
    def add_evidence(db: Session, stage_id: int, link: str, user_id: int) -> Stage:
        stage = WorkflowService.get_stage(db, stage_id)
        
        # Can only add evidence if In Progress or Rework?
        if stage.status not in [StageStatus.IN_PROGRESS.value, StageStatus.REWORK.value]:
             # Allow adding evidence in LOCKED? Probably not.
             # Allow in SUBMITTED? Maybe if trying to update?
             # Let's restrict to IN_PROGRESS/REWORK for now.
             raise HTTPException(status_code=400, detail=f"Cannot add evidence in status {stage.status}")

        if "drive.google.com" not in link:
            raise HTTPException(status_code=400, detail="Evidence link must be a Google Drive URL")
        
        links = list(stage.evidence_links) if stage.evidence_links else []
        links.append(link)
        stage.evidence_links = links
        
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(stage, "evidence_links")
        
        db.commit()
        db.refresh(stage)
        return stage

    @staticmethod
    def get_progress_summary(db: Session, intervention_id: int):
        stages = db.query(Stage).filter(Stage.intervention_id == intervention_id).order_by(Stage.order).all()
        return [
            {"id": stage.id, "name": stage.name, "order": stage.order, "status": stage.status}
            for stage in stages
        ]
