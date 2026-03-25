from fastapi import APIRouter, Depends

from core.dependencies import get_current_admin
from models.admin_user import AdminUser
from schemas.analytics import (
    CountryResponse,
    DeviceResponse,
    FullAnalyticsResponse,
    PublicStatsResponse,
    ReferrerResponse,
)
from services.analytics import (
    get_countries,
    get_devices,
    get_referrers,
    get_website_stats,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("/public", response_model=PublicStatsResponse)
async def get_public_stats():
    stats = await get_website_stats(period_days=36500)
    return PublicStatsResponse(visitor_count=stats["total_visitors"])


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=FullAnalyticsResponse)
async def get_full_stats(
    period_days: int = 30,
    _: AdminUser = Depends(get_current_admin),
):
    stats = await get_website_stats(period_days=period_days)
    referrers = await get_referrers(period_days=period_days)
    devices = await get_devices(period_days=period_days)
    countries = await get_countries(period_days=period_days)
    return FullAnalyticsResponse(
        total_visitors=stats["total_visitors"],
        total_pageviews=stats["total_pageviews"],
        referrers=[ReferrerResponse(**r) for r in referrers],
        devices=[DeviceResponse(**d) for d in devices],
        countries=[CountryResponse(**c) for c in countries],
    )


@router.get("/referrers", response_model=list[ReferrerResponse])
async def get_top_referrers(
    period_days: int = 30,
    _: AdminUser = Depends(get_current_admin),
):
    return [ReferrerResponse(**r) for r in await get_referrers(period_days=period_days)]


@router.get("/devices", response_model=list[DeviceResponse])
async def get_device_breakdown(
    period_days: int = 30,
    _: AdminUser = Depends(get_current_admin),
):
    return [DeviceResponse(**d) for d in await get_devices(period_days=period_days)]


@router.get("/countries", response_model=list[CountryResponse])
async def get_visitor_countries(
    period_days: int = 30,
    _: AdminUser = Depends(get_current_admin),
):
    return [CountryResponse(**c) for c in await get_countries(period_days=period_days)]
