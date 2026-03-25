from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from core.database import AsyncSessionLocal
from services.github import refresh_github_cache

scheduler = AsyncIOScheduler()


async def scheduled_github_refresh():
    """Wrapper so APScheduler can call the async refresh with its own DB session."""
    print("[scheduler] Refreshing GitHub cache...")
    async with AsyncSessionLocal() as db:
        try:
            await refresh_github_cache(db)
            print("[scheduler] GitHub cache refreshed successfully.")
        except Exception as e:
            print(f"[scheduler] GitHub cache refresh failed: {e}")


def start_scheduler():
    scheduler.add_job(
        scheduled_github_refresh,
        trigger=IntervalTrigger(hours=3),
        id="github_cache_refresh",
        replace_existing=True,
    )
    scheduler.start()
    print("[scheduler] Started — GitHub cache refreshes every 3 hours.")


def stop_scheduler():
    scheduler.shutdown()
    print("[scheduler] Stopped.")
