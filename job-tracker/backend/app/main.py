from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import job_application
from app.routes import applications

app = FastAPI(title="Job Application Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Skapa databastabeller
Base.metadata.create_all(bind=engine)

# 🔥 DETTA ÄR RADEN SOM SAKNADES / ÄR FEL
app.include_router(applications.router)

@app.get("/")
def root():
    return {"message": "Job Tracker API"}
