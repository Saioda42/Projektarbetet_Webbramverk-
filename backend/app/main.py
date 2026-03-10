from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Importera models i rätt ordning (User först!)
from app.models.user import User
from app.models import contact
from app.models import job_application
from app.models import cv
from app.models import reminder  # Reminder sist

from app.routes.contact import router as contacts_router
from app.routes import applications
from app.routes.cv import router as cv_router
from app.routes.reminder import router as reminder_router
from app.routes.auth import router as auth_router
from app.routes.platsbanken import router as platsbanken_router
from app.services.reminder_scheduler import start_scheduler

app = FastAPI(title="Job Application Tracker")
app.include_router(auth_router)

# Skapa databastabeller
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrera alla routes
app.include_router(contacts_router)
app.include_router(applications.router)
app.include_router(cv_router)
app.include_router(reminder_router)
app.include_router(platsbanken_router)

@app.get("/")
def root():
    return {"message": "Job Tracker API"}

# Starta reminder scheduler vid app-start
@app.on_event("startup")
def startup_event():
    start_scheduler()