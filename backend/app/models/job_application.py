from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import date


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)

    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)

    status = Column(
        String(50),
        nullable=False,
        default="applied",
        index=True
    )

    applied_date = Column(
        Date,
        nullable=True,
        default=date.today
    )

    source = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    # Audreys tillägg
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Din tillägg
    reminders = relationship("Reminder", back_populates="application", cascade="all, delete-orphan")