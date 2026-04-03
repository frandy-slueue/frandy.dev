from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from core.database import Base

THEMES = ["silver", "cobalt", "ember", "jade"]

# All navigable sections on the main site
SECTIONS = ["about", "skills", "projects", "timeline", "contact"]


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    active_theme: Mapped[str] = mapped_column(String(20), default="silver")
    theme_mode:   Mapped[str] = mapped_column(String(10), default="dark")
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
    social_hashnode: Mapped[str | None] = mapped_column(String(500), nullable=True)
    social_devto: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    contact_whatsapp: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # ── Section visibility ────────────────────────────────────────────
    # Hero is always visible — not togglable.
    section_about:    Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    section_skills:   Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    section_projects: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    section_timeline: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    section_contact:  Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    # ── Hero background pattern ───────────────────────────────────────
    # Options: "grid" | "dots" | "diagonal" | "cross"
    background_pattern: Mapped[str] = mapped_column(String(20), default="grid", server_default="grid")
    