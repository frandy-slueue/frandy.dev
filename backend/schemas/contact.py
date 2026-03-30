import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    phone: str | None = None
    company: str | None = None


class ContactResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    subject: str
    message: str
    phone: str | None
    company: str | None
    is_read: bool
    is_starred: bool
    is_archived: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactListResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    subject: str
    company: str | None
    is_read: bool
    is_starred: bool
    is_archived: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactStatusUpdate(BaseModel):
    is_read: bool | None = None
    is_starred: bool | None = None
    is_archived: bool | None = None
