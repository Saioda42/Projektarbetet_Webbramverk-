# backend/app/models/user.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Relation till CV
    cv = relationship("CV", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")