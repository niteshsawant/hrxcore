from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.db import get_db
from backend.app.models.intervention import Portfolio, Intervention
from backend.app.models.user import User
from backend.app.schemas.intervention import (
    PortfolioCreate,
    Portfolio as PortfolioSchema,
)

router = APIRouter()

@router.post("/", response_model=PortfolioSchema)
def create_portfolio(portfolio: PortfolioCreate, intervention_id: int, practitioner_id: int, db: Session = Depends(get_db)):
    # Verify intervention exists
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    # Verify practitioner exists
    practitioner = db.query(User).filter(User.id == practitioner_id).first()
    if not practitioner:
        raise HTTPException(status_code=404, detail="Practitioner not found")

    db_portfolio = Portfolio(**portfolio.dict(), intervention_id=intervention_id, practitioner_id=practitioner_id)
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

@router.get("/{portfolio_id}", response_model=PortfolioSchema)
def read_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.get("/practitioner/{practitioner_id}", response_model=List[PortfolioSchema])
def read_practitioner_portfolios(practitioner_id: int, db: Session = Depends(get_db)):
    portfolios = db.query(Portfolio).filter(Portfolio.practitioner_id == practitioner_id).all()
    return portfolios

from backend.app.services.portfolio_service import update_master_portfolio

@router.get("/master/my-portfolio")
def get_my_master_portfolio(practitioner_id: int, db: Session = Depends(get_db)):
    # This triggers an update/aggregation and returns the result
    return update_master_portfolio(db, practitioner_id)
