import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_admin
from models.admin_user import AdminUser
from models.resume import Resume
from schemas.resume import ResumeResponse
from services.upload import save_resume, delete_resume

router = APIRouter(prefix="/api/resume", tags=["resume"])


class RenameRequest(BaseModel):
    filename: str


# ── Public ────────────────────────────────────────────────────────────────────

@router.patch("/{resume_id}/activate", response_model=ResumeResponse)
async def activate_resume(
    resume_id: uuid.UUID,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    # Deactivate all
    result = await db.execute(select(Resume))
    for r in result.scalars().all():
        r.is_active = False

    # Activate selected
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    resume.is_active = True

    # Sync to site_settings
    from models.site_settings import SiteSettings
    from datetime import datetime, timezone
    settings_result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    site_settings = settings_result.scalar_one_or_none()
    if site_settings:
        site_settings.resume_url = resume.file_url
        site_settings.resume_uploaded_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(resume)
    return resume


@router.patch("/{resume_id}/rename", response_model=ResumeResponse)
async def rename_resume(
    resume_id: uuid.UUID,
    payload: RenameRequest,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update the display filename of a resume without touching the file."""
    filename = payload.filename.strip()
    if not filename:
        raise HTTPException(status_code=400, detail="Filename cannot be empty")

    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume.filename = filename
    await db.commit()
    await db.refresh(resume)
    return resume


@router.get("/active-url", response_model=dict)
async def get_active_resume_url(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).where(Resume.is_active == True)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        return {"url": None}
    return {"url": resume.file_url}

# ── Admin ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ResumeResponse])
async def list_resumes(
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Resume).order_by(Resume.uploaded_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    url = await save_resume(file)
    resume = Resume(filename=file.filename, file_url=url)
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume_record(
    resume_id: uuid.UUID,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    delete_resume(resume.file_url)
    await db.delete(resume)
    await db.commit()
