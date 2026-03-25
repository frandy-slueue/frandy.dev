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
