from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.db import Base

class MasterPortfolio(Base):
    __tablename__ = "master_portfolios"

    id = Column(Integer, primary_key=True, index=True)
    practitioner_id = Column(Integer, ForeignKey("users.id"), unique=True)
    public_slug = Column(String, unique=True, index=True)
    
    # Aggregated Metrics
    total_interventions = Column(Integer, default=0)
    avg_rating = Column(Float, default=0.0)
    total_cost_saved = Column(Float, default=0.0)
    total_productivity_gain = Column(Float, default=0.0)
    
    last_updated = Column(DateTime, default=datetime.utcnow)
    pdf_url = Column(String, nullable=True)

    practitioner = relationship("User")
