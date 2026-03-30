import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_admin
from models.admin_user import AdminUser
from models.contact import Contact
from schemas.contact import (
    ContactCreate,
    ContactListResponse,
    ContactResponse,
    ContactStatusUpdate,
)
from services.email import send_contact_notification

router = APIRouter(prefix="/api/contact", tags=["contact"])


# ── Public ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact(
    payload: ContactCreate,
    db: AsyncSession = Depends(get_db),
):
    contact = Contact(**payload.model_dump())
    db.add(contact)
    await db.commit()
    await db.refresh(contact)

    await send_contact_notification(
        name=contact.name,
        email=contact.email,
        subject=contact.subject,
        message=contact.message,
        phone=contact.phone,
        company=contact.company,
    )

    return contact


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ContactListResponse])
async def list_contacts(
    filter: str = Query(default="all"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Contact)

    if filter == "unread":
        query = query.where(Contact.is_read == False)
    elif filter == "read":
        query = query.where(Contact.is_read == True)
    elif filter == "starred":
        query = query.where(Contact.is_starred == True)
    elif filter == "archived":
        query = query.where(Contact.is_archived == True)
    else:
        # "all" — exclude archived by default
        query = query.where(Contact.is_archived == False)

    query = (
        query.order_by(Contact.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: uuid.UUID,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Contact).where(Contact.id == contact_id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.patch("/{contact_id}", response_model=ContactResponse)
async def update_contact_status(
    contact_id: uuid.UUID,
    payload: ContactStatusUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Contact).where(Contact.id == contact_id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    if payload.is_read is not None:
        contact.is_read = payload.is_read
    if payload.is_starred is not None:
        contact.is_starred = payload.is_starred
    if payload.is_archived is not None:
        contact.is_archived = payload.is_archived

    await db.commit()
    await db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: uuid.UUID,
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Contact).where(Contact.id == contact_id)
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    await db.delete(contact)
    await db.commit()
