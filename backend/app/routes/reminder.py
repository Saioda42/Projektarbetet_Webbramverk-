# backend/app/routes/reminder.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.reminder import Reminder
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"]
)


# --- Pydantic Schemas ---

class ReminderBase(BaseModel):
    title: str
    description: Optional[str] = None
    remind_date: datetime
    application_id: Optional[int] = None

class ReminderCreate(ReminderBase):
    pass

class ReminderResponse(ReminderBase):
    id: int
    user_id: int
    is_sent: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# --- CRUD Endpoints ---

@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_data: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Skapa en ny påminnelse"""
    new_reminder = Reminder(
        user_id=current_user.id,
        **reminder_data.model_dump()
    )
    
    db.add(new_reminder)
    db.commit()
    db.refresh(new_reminder)
    return new_reminder


@router.get("/", response_model=List[ReminderResponse])
def get_my_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Hämta alla mina påminnelser"""
    reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id
    ).order_by(Reminder.remind_date).all()
    
    return reminders


@router.get("/upcoming", response_model=List[ReminderResponse])
def get_upcoming_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Hämta kommande påminnelser (inte skickade än)"""
    reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        ~Reminder.is_sent,
        Reminder.remind_date >= datetime.utcnow()
    ).order_by(Reminder.remind_date).all()
    
    return reminders


@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Hämta en specifik påminnelse"""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    return reminder


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ta bort en påminnelse"""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    db.delete(reminder)
    db.commit()


@router.put("/{reminder_id}/mark-sent", response_model=ReminderResponse)
def mark_reminder_as_sent(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Markera påminnelse som skickad"""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    reminder.is_sent = True
    db.commit()
    db.refresh(reminder)
    return reminder