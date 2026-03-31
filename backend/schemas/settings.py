from datetime import datetime
from pydantic import BaseModel


class ThemeResponse(BaseModel):
    active_theme: str
    last_theme_changed: datetime

    model_config = {"from_attributes": True}


class ThemeUpdate(BaseModel):
    theme: str


class ResumeResponse(BaseModel):
    resume_url: str | None
    resume_uploaded_at: datetime | None

    model_config = {"from_attributes": True}


class SocialLinks(BaseModel):
    social_github: str | None = None
    social_linkedin: str | None = None
    social_x: str | None = None
    social_facebook: str | None = None
    social_medium: str | None = None
    social_hashnode: str | None = None
    social_devto: str | None = None

    model_config = {"from_attributes": True}


class SocialLinksUpdate(BaseModel):
    social_github: str | None = None
    social_linkedin: str | None = None
    social_x: str | None = None
    social_facebook: str | None = None
    social_medium: str | None = None
    social_hashnode: str | None = None
    social_devto: str | None = None
   

class ContactInfo(BaseModel):
    contact_email: str | None = None
    contact_phone: str | None = None
    contact_whatsapp: str | None = None

    model_config = {"from_attributes": True}


class ContactInfoUpdate(BaseModel):
    contact_email: str | None = None
    contact_phone: str | None = None
    contact_whatsapp: str | None = None
