import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from core.config import settings

UPLOAD_DIR = Path(settings.upload_dir)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def ensure_upload_dir():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def save_thumbnail(file: UploadFile) -> str:
    ensure_upload_dir()

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Must be one of: {', '.join(ALLOWED_TYPES)}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB.",
        )

    ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as f:
        f.write(contents)

    return f"/uploads/{filename}"


def delete_thumbnail(thumbnail_url: str | None) -> None:
    if not thumbnail_url:
        return
    filename = thumbnail_url.lstrip("/uploads/")
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        os.remove(file_path)
