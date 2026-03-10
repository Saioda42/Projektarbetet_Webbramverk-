## backend/app/models/reminder.py

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Reminder(Base):
    """Påminnelser för användare - skickar email vid rätt tid"""
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    remind_date = Column(DateTime, nullable=False)
    
    is_sent = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationer - använd lazy loading
    user = relationship("User", back_populates="reminders", lazy="joined")
    application = relationship("JobApplication", back_populates="reminders", lazy="joined")