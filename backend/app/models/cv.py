# backend/app/models/cv.py

from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class CV(Base):
    """Huvudtabell för CV - en användare har ett CV"""
    __tablename__ = "cvs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Personal info
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    summary = Column(Text, nullable=True)  # Kort pitch om personen
    
    # Relationer
    user = relationship("User", back_populates="cv")
    experiences = relationship("Experience", back_populates="cv", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="cv", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="cv", cascade="all, delete-orphan")


class Experience(Base):
    """Arbetserfarenheter - ett CV kan ha många erfarenheter"""
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # Null = nuvarande jobb
    description = Column(Text, nullable=True)
    
    # Relation
    cv = relationship("CV", back_populates="experiences")


class Education(Base):
    """Utbildningar - ett CV kan ha många utbildningar"""
    __tablename__ = "educations"
    
    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    
    school = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=False)  # t.ex. "Bachelor", "Master"
    field = Column(String(255), nullable=False)   # t.ex. "Computer Science"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # Null = pågående
    
    # Relation
    cv = relationship("CV", back_populates="educations")


class Skill(Base):
    """Skills - ett CV kan ha många skills"""
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id"), nullable=False)
    
    skill_name = Column(String(100), nullable=False)
    
    # Relation
    cv = relationship("CV", back_populates="skills")