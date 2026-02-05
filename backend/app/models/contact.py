from sqlalchemy import Column, Integer, String#, ForeignKey
# from sqlalchemy.orm import relationship
from ..database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    role = Column(String, nullable=True)
    notes = Column(String, nullable=True)


class Refrerence(Base):
    __tablename__ = "references"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    relationship_type = Column(String, nullable=True)
    notes = Column(String, nullable=True)
