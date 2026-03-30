import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_admin
from models.admin_user import AdminUser
from models.resume import Resume
from schemas.resume import ResumeResponse
from services.upload import save_resume, delete_resume

router = APIRouter(prefix="/api/resume", tags=["resume"])


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("/active", response_model=ResumeResponse)
async def get_active_resume(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Resume).where(Resume.is_active == True)
    )
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="No active resume found")
    return resume


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
