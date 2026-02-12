from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.db import Base

class AIInteraction(Base):
    __tablename__ = "ai_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    execution_step_id = Column(Integer, ForeignKey("execution_steps.id"), nullable=True)
    prompt_type = Column(String) # 'guidance', 'feedback'
    input_text = Column(Text, nullable=True)
    output_text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    execution_step = relationship("ExecutionStep")
