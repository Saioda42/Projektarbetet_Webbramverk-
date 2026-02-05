from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import contact
from app.models import job_application
from app.routes.contact import router as contacts_router
from app.routes import applications

# Skapa databastabeller (bara EN gång!)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Application Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrera båda routes
app.include_router(contacts_router)
app.include_router(applications.router)

@app.get("/")
def root():
    return {"message": "Job Tracker API"}
