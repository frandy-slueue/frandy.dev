from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_admin
from models.admin_user import AdminUser
from models.site_settings import SiteSettings, THEMES
from schemas.settings import ResumeResponse, ThemeResponse, ThemeUpdate
from services.resume import save_resume
from schemas.settings import ResumeResponse, SocialLinks, SocialLinksUpdate, ThemeResponse, ThemeUpdate


router = APIRouter(prefix="/api/settings", tags=["settings"])


async def get_or_create_settings(db: AsyncSession) -> SiteSettings:
    """Get the single settings row, creating it with defaults if it doesn't exist."""
    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    row = result.scalar_one_or_none()
    if not row:
        row = SiteSettings(id=1, active_theme="silver")
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("/theme", response_model=ThemeResponse)
async def get_theme(db: AsyncSession = Depends(get_db)):
    """
    Public endpoint — frontend reads this on every page load to apply
    the correct CSS variable set.
    """
    row = await get_or_create_settings(db)
    return row


@router.get("/resume", response_model=ResumeResponse)
async def get_resume(db: AsyncSession = Depends(get_db)):
    """
    Public endpoint — returns the current resume download URL.
    Frontend uses this to wire the Download Resume button.
    """
    row = await get_or_create_settings(db)
    return row


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.put("/theme", response_model=ThemeResponse)
async def set_theme(
    payload: ThemeUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if payload.theme not in THEMES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid theme. Must be one of: {', '.join(THEMES)}",
        )

    row = await get_or_create_settings(db)
    row.active_theme = payload.theme
    row.last_theme_changed = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(row)
    return row


@router.post("/resume", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    url = await save_resume(file)
    row = await get_or_create_settings(db)
    row.resume_url = url
    row.resume_uploaded_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(row)
    return row


@router.delete("/resume", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from services.resume import delete_resume as remove_file
    row = await get_or_create_settings(db)
    remove_file(row.resume_url)
    row.resume_url = None
    row.resume_uploaded_at = None
    await db.commit()


@router.get("/social", response_model=SocialLinks)
async def get_social_links(db: AsyncSession = Depends(get_db)):
    row = await get_or_create_settings(db)
    return row


@router.put("/social", response_model=SocialLinks)
async def update_social_links(
    payload: SocialLinksUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    row = await get_or_create_settings(db)
    row.social_github = payload.social_github or None
    row.social_linkedin = payload.social_linkedin or None
    row.social_x = payload.social_x or None
    row.social_facebook = payload.social_facebook or None
    row.social_medium = payload.social_medium or None
    row.social_hashnode = payload.social_hashnode or None
    row.social_devto = payload.social_devto or None
    await db.commit()
    await db.refresh(row)
    return row
