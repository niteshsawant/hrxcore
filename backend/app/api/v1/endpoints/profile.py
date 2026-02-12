from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from backend.app.core.db import get_db
from backend.app.models.portfolio import MasterPortfolio
from backend.app.models.intervention import Intervention
# from backend.app.services.portfolio_service import get_portfolio_by_slug

router = APIRouter()

class PortfolioIntervention(BaseModel):
    id: int
    name: str
    cost_saved: float
    productivity_gain: float
    # completion_date?

    class Config:
        from_attributes = True

class MasterPortfolioResponse(BaseModel):
    practitioner_name: str
    public_slug: str
    total_interventions: int
    avg_rating: float
    total_cost_saved: float
    total_productivity_gain: float
    last_updated: datetime
    pdf_url: Optional[str]
    interventions: List[PortfolioIntervention]

    class Config:
        from_attributes = True

@router.get("/profile/{public_slug}", response_model=MasterPortfolioResponse)
def get_public_profile(public_slug: str, db: Session = Depends(get_db)):
    portfolio = db.query(MasterPortfolio).filter(MasterPortfolio.public_slug == public_slug).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get interventions for this practitioner (completed/approved)
    # Using the same logic as service, assuming we want to show what was aggregated
    interventions = db.query(Intervention).filter(
        Intervention.assigned_practitioner_id == portfolio.practitioner_id,
        Intervention.status == "completed"
    ).all()

    return MasterPortfolioResponse(
        practitioner_name=portfolio.practitioner.name if portfolio.practitioner else "Unknown Practitioner",
        public_slug=portfolio.public_slug,
        total_interventions=portfolio.total_interventions,
        avg_rating=portfolio.avg_rating,
        total_cost_saved=portfolio.total_cost_saved,
        total_productivity_gain=portfolio.total_productivity_gain,
        last_updated=portfolio.last_updated,
        pdf_url=portfolio.pdf_url,
        interventions=interventions
)
