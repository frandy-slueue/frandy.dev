import uuid
from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: str
    case_study: str | None = None
    category: str
    status: str = "coming_soon"
    stack_tags: list[str] = []
    demo_url: str | None = None
    github_url: str | None = None
    thumbnail_url: str | None = None
    is_featured: bool = False
    is_published: bool = False
    sort_order: int = 0


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    case_study: str | None = None
    category: str | None = None
    status: str | None = None
    stack_tags: list[str] | None = None
    demo_url: str | None = None
    github_url: str | None = None
    thumbnail_url: str | None = None
    is_featured: bool | None = None
    is_published: bool | None = None
    sort_order: int | None = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    case_study: str | None
    category: str
    status: str
    stack_tags: list[str]
    demo_url: str | None
    github_url: str | None
    thumbnail_url: str | None
    is_featured: bool
    is_published: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReorderItem(BaseModel):
    id: uuid.UUID
    sort_order: int


class ReorderRequest(BaseModel):
    projects: list[ReorderItem]
