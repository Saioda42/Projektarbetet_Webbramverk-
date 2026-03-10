from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.job_application import JobApplication
from app.models.contact import Contact
from app.models.reminder import Reminder
from app.models.cv import CV, Skill

router = APIRouter(prefix="/platsbanken", tags=["platsbanken"])

JOBSEARCH_BASE_URL = "https://jobsearch.api.jobtechdev.se"


# --- Pydantic schemas ---

class SaveApplicationRequest(BaseModel):
    platsbanken_ad_id: str
    company: str
    role: str
    source: str = "Platsbanken"
    notes: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class SaveReminderRequest(BaseModel):
    application_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    remind_date: str  # ISO format datetime string


# --- Endpoints ---

@router.get("/search")
def search_jobs(
    q: str = "",
    offset: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
):
    with httpx.Client(timeout=15.0) as client:
        response = client.get(
            f"{JOBSEARCH_BASE_URL}/search",
            params={"q": q, "offset": offset, "limit": limit},
            headers={"accept": "application/json"},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Kunde inte söka jobb")
        return response.json()


@router.get("/ad/{ad_id}")
def get_ad(
    ad_id: str,
    current_user: User = Depends(get_current_user),
):
    with httpx.Client(timeout=15.0) as client:
        response = client.get(
            f"{JOBSEARCH_BASE_URL}/ad/{ad_id}",
            headers={"accept": "application/json"},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Kunde inte hämta annons")
        return response.json()


@router.get("/complete")
def autocomplete(
    q: str = "",
    current_user: User = Depends(get_current_user),
):
    with httpx.Client(timeout=10.0) as client:
        response = client.get(
            f"{JOBSEARCH_BASE_URL}/complete",
            params={"q": q},
            headers={"accept": "application/json"},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Autocomplete misslyckades")
        return response.json()


@router.post("/save-application")
def save_application(
    data: SaveApplicationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Skapa JobApplication
    application = JobApplication(
        company=data.company,
        role=data.role,
        status="interested",
        source=data.source,
        notes=f"Platsbanken ID: {data.platsbanken_ad_id}" + (f"\n{data.notes}" if data.notes else ""),
        user_id=current_user.id,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # Skapa Contact om kontaktinfo finns
    contact = None
    if data.contact_name and data.contact_email:
        existing = db.query(Contact).filter(Contact.email == data.contact_email).first()
        if not existing:
            contact = Contact(
                name=data.contact_name,
                email=data.contact_email,
                phone=data.contact_phone,
                company=data.company,
            )
            db.add(contact)
            db.commit()
            db.refresh(contact)

    return {
        "application": {
            "id": application.id,
            "company": application.company,
            "role": application.role,
            "status": application.status,
        },
        "contact_created": contact is not None,
    }


@router.post("/save-reminder")
def save_reminder(
    data: SaveReminderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = Reminder(
        user_id=current_user.id,
        application_id=data.application_id,
        title=data.title,
        description=data.description,
        remind_date=datetime.fromisoformat(data.remind_date),
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return {
        "id": reminder.id,
        "title": reminder.title,
        "remind_date": str(reminder.remind_date),
    }


@router.get("/match-cv")
def match_cv(
    ad_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Hämta användarens CV och skills
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="Inget CV hittat. Skapa ett under CV-sidan.")

    user_skills = [s.skill_name.lower() for s in cv.skills]

    # Hämta annonsen
    with httpx.Client(timeout=15.0) as client:
        response = client.get(
            f"{JOBSEARCH_BASE_URL}/ad/{ad_id}",
            headers={"accept": "application/json"},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Kunde inte hämta annons")
        ad = response.json()

    # Samla annonsens krav
    ad_skills = set()

    for skill in (ad.get("must_have") or {}).get("skills", []):
        ad_skills.add(skill.get("label", "").lower())

    for skill in (ad.get("nice_to_have") or {}).get("skills", []):
        ad_skills.add(skill.get("label", "").lower())

    # Ta bort tomma
    ad_skills.discard("")

    if not ad_skills:
        return {
            "match_percentage": 0,
            "matched_skills": [],
            "missing_skills": [],
            "message": "Annonsen har inga specificerade färdighetskrav.",
        }

    matched = [s for s in ad_skills if s in user_skills]
    missing = [s for s in ad_skills if s not in user_skills]

    percentage = round((len(matched) / len(ad_skills)) * 100) if ad_skills else 0

    return {
        "match_percentage": percentage,
        "matched_skills": matched,
        "missing_skills": missing,
    }
