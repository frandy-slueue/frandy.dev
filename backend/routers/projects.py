import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_admin
from models.admin_user import AdminUser
from models.project import Project
from schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    ReorderRequest,
)
from services.upload import delete_thumbnail, save_thumbnail

router = APIRouter(prefix="/api/projects", tags=["projects"])


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ProjectResponse])
async def get_projects(
    category: str | None = None,
    featured_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    query = select(Project).where(Project.is_published == True)

    if category:
        query = query.where(Project.category == category)
    if featured_only:
        query = query.where(Project.is_featured == True)

    query = query.order_by(Project.sort_order)
    result = await db.execute(query)
    return result.scalars().all()


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.get("/all", response_model=list[ProjectResponse])
async def get_all_projects(
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).order_by(Project.sort_order)
    )
    return result.scalars().all()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    project = Project(**payload.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    delete_thumbnail(project.thumbnail_url)
    await db.delete(project)
    await db.commit()


@router.post("/reorder", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_projects(
    payload: ReorderRequest,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    for item in payload.projects:
        result = await db.execute(
            select(Project).where(Project.id == item.id)
        )
        project = result.scalar_one_or_none()
        if project:
            project.sort_order = item.sort_order

    await db.commit()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_thumbnail(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
):
    url = await save_thumbnail(file)
    return {"url": url}