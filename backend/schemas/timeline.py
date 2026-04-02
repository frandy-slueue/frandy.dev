import uuid
from pydantic import BaseModel


class TimelineEntryBase(BaseModel):
    sort_order:  int    = 0
    period:      str
    date_label:  str    = ""
    title:       str
    category:    str
    description: str    = ""


class TimelineEntryCreate(TimelineEntryBase):
    pass


class TimelineEntryUpdate(TimelineEntryBase):
    pass


class TimelineEntryResponse(TimelineEntryBase):
    id:        uuid.UUID
    image_url: str | None = None

    model_config = {"from_attributes": True}
