from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.contact import Contact
from pydantic import BaseModel

router = APIRouter(
    prefix="/contacts",
    tags=["contacts"]
)

# Pydantic schemas (för validering av data)
class ContactBase(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    role: str | None = None
    notes: str | None = None

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    
    class Config:
        from_attributes = True  # Gör att Pydantic kan läsa från SQLAlchemy models


# --- CRUD Endpoints ---

# CREATE - Skapa ny contact
@router.post("/", response_model=ContactResponse)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    db_contact = Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


# READ ALL - Hämta alla contacts
@router.get("/", response_model=List[ContactResponse])
def get_contacts(db: Session = Depends(get_db)):
    contacts = db.query(Contact).all()
    return contacts


# READ ONE - Hämta en specifik contact
@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


# UPDATE - Uppdatera en contact
@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, contact_update: ContactCreate, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    for key, value in contact_update.model_dump().items():
        setattr(contact, key, value)
    
    db.commit()
    db.refresh(contact)
    return contact


# DELETE - Ta bort en contact
@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted successfully"}