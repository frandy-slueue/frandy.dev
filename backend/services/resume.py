import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from core.config import settings

RESUME_DIR = Path(settings.upload_dir) / "resume"
ALLOWED_TYPES = {"application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def ensure_resume_dir():
    RESUME_DIR.mkdir(parents=True, exist_ok=True)


async def save_resume(file: UploadFile) -> str:
    ensure_resume_dir()

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted for resume upload.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum resume size is 10MB.",
        )

    # Always save as the same filename so the download URL never changes
    filename = "frandy-slueue-resume.pdf"
    file_path = RESUME_DIR / filename

    with open(file_path, "wb") as f:
        f.write(contents)

    return f"/uploads/resume/{filename}"


def delete_resume(resume_url: str | None) -> None:
    if not resume_url:
        return
    filename = resume_url.split("/")[-1]
    file_path = RESUME_DIR / filename
    if file_path.exists():
        os.remove(file_path)
