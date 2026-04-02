import uuid

from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class TimelineEntry(Base):
    __tablename__ = "timeline_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    sort_order:  Mapped[int]      = mapped_column(Integer, default=0)
    period:      Mapped[str]      = mapped_column(String(20))   # "2023" / "Before"
    date_label:  Mapped[str]      = mapped_column(String(50), default="")  # "January"
    title:       Mapped[str]      = mapped_column(String(200))
    category:    Mapped[str]      = mapped_column(String(50))   # Education / Work / Milestone / …
    description: Mapped[str]      = mapped_column(Text, default="")
    image_url:   Mapped[str|None] = mapped_column(String(500), nullable=True)
