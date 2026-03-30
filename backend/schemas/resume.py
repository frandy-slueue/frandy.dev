import uuid
from datetime import datetime
from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: uuid.UUID
    filename: str
    file_url: str
    is_active: bool
    uploaded_at: datetime

    model_config = {"from_attributes": True}
