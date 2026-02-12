from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.intervention import Intervention, Stage
from backend.app.models.portfolio import MasterPortfolio
import uuid

def update_master_portfolio(db: Session, practitioner_id: int):
    # Get or create MasterPortfolio
    portfolio = db.query(MasterPortfolio).filter(MasterPortfolio.practitioner_id == practitioner_id).first()
    if not portfolio:
        portfolio = MasterPortfolio(
            practitioner_id=practitioner_id,
            public_slug=str(uuid.uuid4())[:8] # Generate a random slug initially
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

    # Aggregate Data from Completed Interventions
    # "Completed" could mean status='completed' or all stages approved.
    # For now, let's assume we aggregate ALL interventions for the practitioner to show total impact,
    # or we can filter by status="completed". Let's stick to status="completed" or at least "active" if we want live data.
    # The requirement says "completed interventions".
    
    interventions = db.query(Intervention).filter(
        Intervention.assigned_practitioner_id == practitioner_id,
        Intervention.status == "completed"
    ).all()
    
    total_interventions = len(interventions)
    
    total_cost_saved = sum(i.cost_saved for i in interventions if i.cost_saved)
    total_productivity_gain = sum(i.productivity_gain for i in interventions if i.productivity_gain)
    
    # Calculate Avg Rating across all approved stages of these interventions
    total_rating_sum = 0
    total_rating_count = 0
    
    for intervention in interventions:
        for stage in intervention.stages:
            if stage.status == "approved" and stage.rating:
                total_rating_sum += stage.rating
                total_rating_count += 1
                
    avg_rating = 0.0
    if total_rating_count > 0:
        avg_rating = round(total_rating_sum / total_rating_count, 1)

    # Update Portfolio
    portfolio.total_interventions = total_interventions
    portfolio.total_cost_saved = total_cost_saved
    portfolio.total_productivity_gain = total_productivity_gain
    portfolio.avg_rating = avg_rating
    
    # Mock PDF Generation
    portfolio.pdf_url = f"https://hrx-core.com/files/portfolio_{portfolio.public_slug}.pdf"
    
    db.commit()
    db.refresh(portfolio)
    return portfolio

def get_portfolio_by_slug(db: Session, slug: str):
    return db.query(MasterPortfolio).filter(MasterPortfolio.public_slug == slug).first()
