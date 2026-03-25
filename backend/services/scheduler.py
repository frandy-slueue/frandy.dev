from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from core.database import AsyncSessionLocal
from services.github import refresh_github_cache

scheduler = AsyncIOScheduler()

THEME_ROTATION = ["silver", "cobalt", "ember", "jade"]
THEME_ROTATION_DAYS = 90


async def scheduled_github_refresh():
    print("[scheduler] Refreshing GitHub cache...")
    async with AsyncSessionLocal() as db:
        try:
            await refresh_github_cache(db)
            print("[scheduler] GitHub cache refreshed successfully.")
        except Exception as e:
            print(f"[scheduler] GitHub cache refresh failed: {e}")


async def scheduled_theme_rotation():
    """
    Checks daily whether 90 days have passed since the last theme change.
    If so, rotates to the next theme in the cycle.
    Auto-rotation only runs if the admin has not manually overridden
    within the last 90 days — the last_theme_changed timestamp governs both.
    """
    from datetime import datetime, timezone, timedelta
    from sqlalchemy import select
    from models.site_settings import SiteSettings

    print("[scheduler] Checking theme rotation...")
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
            settings_row = result.scalar_one_or_none()
            if not settings_row:
                return

            now = datetime.now(timezone.utc)
            last_changed = settings_row.last_theme_changed
            if last_changed.tzinfo is None:
                last_changed = last_changed.replace(tzinfo=timezone.utc)

            days_elapsed = (now - last_changed).days
            if days_elapsed >= THEME_ROTATION_DAYS:
                current_idx = THEME_ROTATION.index(settings_row.active_theme)
                next_theme = THEME_ROTATION[(current_idx + 1) % len(THEME_ROTATION)]
                settings_row.active_theme = next_theme
                settings_row.last_theme_changed = now
                await db.commit()
                print(f"[scheduler] Theme rotated to: {next_theme}")
            else:
                days_remaining = THEME_ROTATION_DAYS - days_elapsed
                print(f"[scheduler] Theme rotation in {days_remaining} days.")
        except Exception as e:
            print(f"[scheduler] Theme rotation failed: {e}")


def start_scheduler():
    scheduler.add_job(
        scheduled_github_refresh,
        trigger=IntervalTrigger(hours=3),
        id="github_cache_refresh",
        replace_existing=True,
    )
    scheduler.add_job(
        scheduled_theme_rotation,
        trigger=IntervalTrigger(hours=24),
        id="theme_rotation",
        replace_existing=True,
    )
    scheduler.start()
    print("[scheduler] Started — GitHub refreshes every 3hrs, theme checks every 24hrs.")


def stop_scheduler():
    scheduler.shutdown()
    print("[scheduler] Stopped.")