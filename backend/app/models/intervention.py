from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum as SqlEnum, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from backend.app.core.db import Base

class StageStatus(str, enum.Enum):
    LOCKED = "locked"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REWORK = "rework"

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    objective = Column(Text)
    assigned_practitioner_id = Column(Integer, ForeignKey("users.id"))
    assigned_mentor_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="active") # active, completed, archived
    cost_saved = Column(Float, default=0.0)
    productivity_gain = Column(Float, default=0.0)

    stages = relationship("Stage", back_populates="intervention")
    portfolio = relationship("Portfolio", back_populates="intervention", uselist=False)

class Stage(Base):
    __tablename__ = "stages"

    id = Column(Integer, primary_key=True, index=True)
    intervention_id = Column(Integer, ForeignKey("interventions.id"))
    name = Column(String)
    order = Column(Integer)
    status = Column(String, default=StageStatus.LOCKED.value)
    
    # Evidence & Review
    evidence_links = Column(JSON, default=[]) # List of Google Drive links
    rating = Column(Integer, nullable=True) # 1-5
    mentor_feedback = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)

    intervention = relationship("Intervention", back_populates="stages")
    execution_steps = relationship("ExecutionStep", back_populates="stage")

class ExecutionStep(Base):
    __tablename__ = "execution_steps"

    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("stages.id"))
    title = Column(String)
    guidance_text = Column(Text)
    is_required = Column(Boolean, default=True)
    is_enabled = Column(Boolean, default=True)
    order = Column(Integer, default=0)

    stage = relationship("Stage", back_populates="execution_steps")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    practitioner_id = Column(Integer, ForeignKey("users.id"))
    intervention_id = Column(Integer, ForeignKey("interventions.id"))
    pdf_url = Column(String)
    public_link = Column(String)

    intervention = relationship("Intervention", back_populates="portfolio")
