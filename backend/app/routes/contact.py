from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.contact import Contact
from pydantic import BaseModel, EmailStr, field_validator, Field
import re

router = APIRouter(
    prefix="/contacts",
    tags=["contacts"]
)

# Pydantic schemas med validering
class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr  # Pydantic validerar email automatiskt
    phone: str = Field(..., min_length=8, max_length=20)
    company: str = Field(..., min_length=2, max_length=100)
    role: str = Field(..., min_length=2, max_length=100)
    notes: str | None = Field(None, max_length=500)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        # Ta bort extra mellanslag
        v = v.strip()
        
        # Kolla att det inte är tomt
        if not v:
            raise ValueError('Namn får inte vara tomt')
        
        # Kolla att det inte innehåller siffror
        if re.search(r'\d', v):
            raise ValueError('Namn får inte innehålla siffror')
        
        # Kolla att det finns minst två ord (för- och efternamn)
        name_parts = v.split()
        if len(name_parts) < 2:
            raise ValueError('Ange både för- och efternamn')
        
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        # Ta bort mellanslag, bindestreck, parenteser
        clean_phone = re.sub(r'[\s\-()]', '', v)
        
        # Måste börja med + eller 0, följt av 7-15 siffror
        if not re.match(r'^(\+|0)[0-9]{7,15}$', clean_phone):
            raise ValueError('Ange ett giltigt telefonnummer (minst 8 siffror)')
        
        return v

    @field_validator('company')
    @classmethod
    def validate_company(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError('Företagsnamn måste vara minst 2 tecken')
        return v

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError('Roll måste vara minst 2 tecken')
        return v

    @field_validator('notes')
    @classmethod
    def validate_notes(cls, v):
        if v:
            v = v.strip()
            if len(v) > 500:
                raise ValueError('Anteckningar får inte vara längre än 500 tecken')
        return v

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    
    class Config:
        from_attributes = True


# --- CRUD Endpoints ---

# CREATE
@router.post("/", response_model=ContactResponse)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    try:
        db_contact = Contact(**contact.model_dump())
        db.add(db_contact)
        db.commit()
        db.refresh(db_contact)
        return db_contact
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


# READ ALL
@router.get("/", response_model=List[ContactResponse])
def get_contacts(db: Session = Depends(get_db)):
    contacts = db.query(Contact).all()
    return contacts


# READ ONE
@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


# UPDATE
@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, contact_update: ContactCreate, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    try:
        for key, value in contact_update.model_dump().items():
            setattr(contact, key, value)
        
        db.commit()
        db.refresh(contact)
        return contact
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


# DELETE
@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted successfully"}