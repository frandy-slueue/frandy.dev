import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_admin
from models.admin_user import AdminUser
from models.timeline import TimelineEntry
from schemas.timeline import TimelineEntryCreate, TimelineEntryResponse, TimelineEntryUpdate
from services.upload import save_thumbnail, delete_thumbnail

router = APIRouter(prefix="/api/timeline", tags=["timeline"])


# ── Public ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[TimelineEntryResponse])
async def list_entries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TimelineEntry).order_by(TimelineEntry.sort_order)
    )
    return result.scalars().all()


# ── Admin ──────────────────────────────────────────────────────────────────────

@router.post("", response_model=TimelineEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(
    payload: TimelineEntryCreate,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    entry = TimelineEntry(**payload.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=TimelineEntryResponse)
async def update_entry(
    entry_id: uuid.UUID,
    payload: TimelineEntryUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TimelineEntry).where(TimelineEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    for k, v in payload.model_dump().items():
        setattr(entry, k, v)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: uuid.UUID,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TimelineEntry).where(TimelineEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    delete_thumbnail(entry.image_url)
    await db.delete(entry)
    await db.commit()


@router.patch("/{entry_id}/image", response_model=TimelineEntryResponse)
async def upload_image(
    entry_id: uuid.UUID,
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TimelineEntry).where(TimelineEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    delete_thumbnail(entry.image_url)
    entry.image_url = await save_thumbnail(file)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}/image", response_model=TimelineEntryResponse)
async def remove_image(
    entry_id: uuid.UUID,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TimelineEntry).where(TimelineEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    delete_thumbnail(entry.image_url)
    entry.image_url = None
    await db.commit()
    await db.refresh(entry)
    return entry


@router.patch("/{entry_id}/reorder", response_model=TimelineEntryResponse)
async def reorder_entry(
    entry_id: uuid.UUID,
    sort_order: int,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TimelineEntry).where(TimelineEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry.sort_order = sort_order
    await db.commit()
    await db.refresh(entry)
    return entry
