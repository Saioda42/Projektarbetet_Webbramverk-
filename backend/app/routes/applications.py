from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional
from datetime import date

from app.database import get_db
from app.models.job_application import JobApplication
from pydantic import BaseModel
from app.routes.auth import get_current_user


router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


# ---------
# Schemas
# ---------

class JobApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "applied"
    applied_date: Optional[date] = None
    source: Optional[str] = None
    notes: Optional[str] = None


class JobApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None
    source: Optional[str] = None
    notes: Optional[str] = None


class JobApplicationResponse(JobApplicationCreate):
    id: int

    class Config:
        from_attributes = True


# ---------
# CREATE
# ---------

@router.post(
    "/",
    response_model=JobApplicationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_application(
    application: JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    db_application = JobApplication(
        **application.dict(),
        user_id=current_user.id
    )

    db.add(db_application)
    db.commit()
    db.refresh(db_application)

    return db_application


# ---------
# READ (ALL)
# ---------

@router.get("/", response_model=list[JobApplicationResponse])
def get_applications(
    status: Optional[str] = Query(None, description="Filter by status"),
    order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):

    query = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    )

    if status:
        query = query.filter(JobApplication.status == status)

    if order == "asc":
        query = query.order_by(asc(JobApplication.applied_date))
    else:
        query = query.order_by(desc(JobApplication.applied_date))

    return query.all()


# ---------
# STATS  (MUST COME BEFORE /{application_id})
# ---------

@router.get("/stats")
def get_application_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    applications = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
        .all()
    )

    total = len(applications)

    applied = len([
        app for app in applications
        if app.status.lower() == "applied"
    ])

    interview = len([
        app for app in applications
        if app.status.lower() == "interview"
    ])

    rejected = len([
        app for app in applications
        if app.status.lower() == "rejected"
    ])

    return {
        "total": total,
        "applied": applied,
        "interview": interview,
        "rejected": rejected
    }


# ---------
# READ (ONE)
# ---------

@router.get("/{application_id}", response_model=JobApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):

    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.id == application_id,
            JobApplication.user_id == current_user.id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    return application


# ---------
# UPDATE
# ---------

@router.put("/{application_id}", response_model=JobApplicationResponse)
def update_application(
    application_id: int,
    updates: JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.id == application_id,
            JobApplication.user_id == current_user.id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)

    return application


# ---------
# DELETE
# ---------

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.id == application_id,
            JobApplication.user_id == current_user.id
        )
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()