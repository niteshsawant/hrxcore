from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

# ExecutionStep Schemas
class ExecutionStepBase(BaseModel):
    title: str
    guidance_text: Optional[str] = None
    is_required: bool = True
    is_enabled: bool = True
    order: int = 0

class ExecutionStepCreate(ExecutionStepBase):
    pass

class ExecutionStep(ExecutionStepBase):
    id: int
    stage_id: int

    class Config:
        from_attributes = True

# Stage Schemas
class StageBase(BaseModel):
    name: str
    order: int
    status: Optional[str] = "locked"

class StageCreate(StageBase):
    execution_steps: List[ExecutionStepCreate] = []

class StageUpdate(BaseModel):
    status: Optional[str] = None
    rating: Optional[int] = None
    mentor_feedback: Optional[str] = None
    evidence_links: Optional[List[str]] = None

class Stage(StageBase):
    id: int
    intervention_id: int
    execution_steps: List[ExecutionStep] = []
    
    # Evidence & Review
    evidence_links: List[str] = []
    rating: Optional[int] = None
    mentor_feedback: Optional[str] = None
    reviewed_by: Optional[int] = None
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Portfolio Schemas
class PortfolioBase(BaseModel):
    pdf_url: Optional[str] = None
    public_link: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    practitioner_id: int
    intervention_id: int

    class Config:
        from_attributes = True

# Intervention Schemas
class InterventionBase(BaseModel):
    name: str
    objective: Optional[str] = None
    status: Optional[str] = "active"
    cost_saved: Optional[float] = 0.0
    productivity_gain: Optional[float] = 0.0

class InterventionCreate(InterventionBase):
    assigned_practitioner_id: Optional[int] = None
    assigned_mentor_id: Optional[int] = None

class InterventionUpdate(BaseModel):
    name: Optional[str] = None
    objective: Optional[str] = None
    status: Optional[str] = None
    assigned_practitioner_id: Optional[int] = None
    assigned_mentor_id: Optional[int] = None
    cost_saved: Optional[float] = None
    productivity_gain: Optional[float] = None

class Intervention(InterventionBase):
    id: int
    assigned_practitioner_id: Optional[int]
    assigned_mentor_id: Optional[int]
    stages: List[Stage] = []
    portfolio: Optional[Portfolio] = None

    class Config:
        from_attributes = True

# Evidence Link Schema
class EvidenceLinkCreate(BaseModel):
    link: str
