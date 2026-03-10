# backend/app/routes/cv.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.cv import CV, Experience, Education, Skill
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/cv",
    tags=["CV"]
)


# --- Pydantic Schemas ---

class ExperienceBase(BaseModel):
    company: str
    role: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None

class ExperienceResponse(ExperienceBase):
    id: int
    cv_id: int
    
    class Config:
        from_attributes = True


class EducationBase(BaseModel):
    school: str
    degree: str
    field: str
    start_date: date
    end_date: Optional[date] = None

class EducationResponse(EducationBase):
    id: int
    cv_id: int
    
    class Config:
        from_attributes = True


class SkillBase(BaseModel):
    skill_name: str

class SkillResponse(SkillBase):
    id: int
    cv_id: int
    
    class Config:
        from_attributes = True


class CVBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    summary: Optional[str] = None

class CVCreate(CVBase):
    pass

class CVResponse(CVBase):
    id: int
    user_id: int
    experiences: List[ExperienceResponse] = []
    educations: List[EducationResponse] = []
    skills: List[SkillResponse] = []
    
    class Config:
        from_attributes = True


# --- CV CRUD ---

@router.get("/me", response_model=CVResponse)
def get_my_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Hämta mitt CV"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found. Create one first!"
        )
    
    return cv


@router.post("/", response_model=CVResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_cv(
    cv_data: CVCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Skapa eller uppdatera CV"""
    # Kolla om CV redan finns
    existing_cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if existing_cv:
        # Uppdatera befintligt CV
        for key, value in cv_data.model_dump().items():
            setattr(existing_cv, key, value)
        db.commit()
        db.refresh(existing_cv)
        return existing_cv
    else:
        # Skapa nytt CV
        new_cv = CV(
            user_id=current_user.id,
            **cv_data.model_dump()
        )
        db.add(new_cv)
        db.commit()
        db.refresh(new_cv)
        return new_cv


# --- EXPERIENCE CRUD ---

@router.post("/experience", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def add_experience(
    exp_data: ExperienceBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lägg till arbetserfarenhet"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a CV first"
        )
    
    new_exp = Experience(cv_id=cv.id, **exp_data.model_dump())
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp


@router.delete("/experience/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    exp_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ta bort arbetserfarenhet"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if not cv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")
    
    exp = db.query(Experience).filter(
        Experience.id == exp_id,
        Experience.cv_id == cv.id
    ).first()
    
    if not exp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")
    
    db.delete(exp)
    db.commit()


# --- EDUCATION CRUD ---

@router.post("/education", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def add_education(
    edu_data: EducationBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lägg till utbildning"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a CV first"
        )
    
    new_edu = Education(cv_id=cv.id, **edu_data.model_dump())
    db.add(new_edu)
    db.commit()
    db.refresh(new_edu)
    return new_edu


@router.delete("/education/{edu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(
    edu_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ta bort utbildning"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if not cv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")
    
    edu = db.query(Education).filter(
        Education.id == edu_id,
        Education.cv_id == cv.id
    ).first()
    
    if not edu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education not found")
    
    db.delete(edu)
    db.commit()


# --- SKILL CRUD ---

@router.post("/skill", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def add_skill(
    skill_data: SkillBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lägg till skill"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a CV first"
        )
    
    new_skill = Skill(cv_id=cv.id, **skill_data.model_dump())
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


@router.delete("/skill/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ta bort skill"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    
    if not cv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")
    
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.cv_id == cv.id
    ).first()
    
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    
    db.delete(skill)
    db.commit()