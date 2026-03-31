from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from core.database import Base

THEMES = ["silver", "cobalt", "ember", "jade"]


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    active_theme: Mapped[str] = mapped_column(String(20), default="silver")
    last_theme_changed: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    resume_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_uploaded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    social_github: Mapped[str | None] = mapped_column(String(500), nullable=True)
    social_linkedin: Mapped[str | None] = mapped_column(String(500), nullable=True)
    social_x: Mapped[str | None] = mapped_column(String(500), nullable=True)
    social_facebook: Mapped[str | None] = mapped_column(String(500), nullable=True)
    social_medium: Mapped[str | None] = mapped_column(String(500), nullable=True)
