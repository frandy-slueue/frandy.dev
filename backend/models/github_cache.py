from datetime import datetime

from sqlalchemy import DateTime, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from core.database import Base


class GithubCache(Base):
    __tablename__ = "github_cache"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    total_commits: Mapped[int | None] = mapped_column(Integer, nullable=True)
    languages: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    activity_graph: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    pinned_repos: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    last_updated: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
