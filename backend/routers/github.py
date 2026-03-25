from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_admin
from models.admin_user import AdminUser
from models.github_cache import GithubCache
from schemas.github import GithubPinnedResponse, GithubStatsResponse
from services.github import refresh_github_cache

router = APIRouter(prefix="/api/github", tags=["github"])


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=GithubStatsResponse)
async def get_github_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GithubCache).where(GithubCache.id == 1))
    cache = result.scalar_one_or_none()
    if not cache:
        raise HTTPException(
            status_code=404,
            detail="GitHub stats not yet cached. Trigger a refresh from the admin panel.",
        )
    return cache


@router.get("/pinned", response_model=GithubPinnedResponse)
async def get_pinned_repos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GithubCache).where(GithubCache.id == 1))
    cache = result.scalar_one_or_none()
    if not cache:
        raise HTTPException(
            status_code=404,
            detail="GitHub stats not yet cached. Trigger a refresh from the admin panel.",
        )
    return cache


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.post("/refresh")
async def force_refresh(
    _: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        cache = await refresh_github_cache(db)
        return {
            "message": "GitHub cache refreshed successfully.",
            "last_updated": cache.last_updated,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh GitHub cache: {str(e)}",
        )
