# backend/app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr

from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models.user import User
from app.models.job_application import JobApplication
from app.models.contact import Contact
from app.models.cv import CV
from app.models.reminder import Reminder

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

SECRET_KEY = "supersecretkey"  # I produktion: använd environment variable!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# Pydantic schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- REGISTER ---
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Kolla om email redan finns
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hasha lösenordet
    hashed_password = pwd_context.hash(user_data.password)
    
    # Skapa användare
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Skapa token
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}


# --- LOGIN ---
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={"sub": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# --- Helper function ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# --- GET CURRENT USER (för protected routes) ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Hämtar den inloggade användaren från JWT token.
    Används av Audrey i applications.py för att skydda routes.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        # Hämta användare från databas
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


# --- GDPR: EXPORTERA ALL ANVÄNDARDATA ---
@router.get("/export-data")
def export_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = {
        "user": {
            "id": current_user.id,
            "email": current_user.email
        },
        "job_applications": [],
        "contacts": [],
        "cv": None,
        "reminders": []
    }

    applications = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).all()
    for app in applications:
        data["job_applications"].append({
            "company": app.company,
            "role": app.role,
            "status": app.status,
            "applied_date": str(app.applied_date) if app.applied_date else None,
            "source": app.source,
            "notes": app.notes
        })

    contacts = db.query(Contact).all()
    for c in contacts:
        data["contacts"].append({
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "company": c.company,
            "role": c.role,
            "notes": c.notes
        })

    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    if cv:
        data["cv"] = {
            "full_name": cv.full_name,
            "email": cv.email,
            "phone": cv.phone,
            "summary": cv.summary,
            "experiences": [
                {
                    "company": exp.company,
                    "role": exp.role,
                    "start_date": str(exp.start_date),
                    "end_date": str(exp.end_date) if exp.end_date else None,
                    "description": exp.description
                } for exp in cv.experiences
            ],
            "educations": [
                {
                    "school": edu.school,
                    "degree": edu.degree,
                    "field": edu.field,
                    "start_date": str(edu.start_date),
                    "end_date": str(edu.end_date) if edu.end_date else None
                } for edu in cv.educations
            ],
            "skills": [s.skill_name for s in cv.skills]
        }

    reminders = db.query(Reminder).filter(Reminder.user_id == current_user.id).all()
    for r in reminders:
        data["reminders"].append({
            "title": r.title,
            "description": r.description,
            "remind_date": str(r.remind_date),
            "is_sent": r.is_sent
        })

    return data


# --- GDPR: RADERA KONTO OCH ALL DATA ---
@router.delete("/account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Reminder).filter(Reminder.user_id == current_user.id).delete()
    db.query(JobApplication).filter(JobApplication.user_id == current_user.id).delete()

    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    if cv:
        db.delete(cv)

    db.delete(current_user)
    db.commit()

    return {"message": "Konto och all data har raderats"}