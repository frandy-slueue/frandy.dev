import time

import httpx

from core.config import settings

UMAMI_HEADERS = {"x-umami-api-key": settings.umami_api_key}


async def get_website_stats(period_days: int = 30) -> dict:
    end_at = int(time.time() * 1000)
    start_at = end_at - (period_days * 24 * 60 * 60 * 1000)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.umami_api_url}/websites/{settings.umami_website_id}/stats",
                headers=UMAMI_HEADERS,
                params={"startAt": start_at, "endAt": end_at},
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "total_visitors": data.get("visitors", {}).get("value", 0),
                    "total_pageviews": data.get("pageviews", {}).get("value", 0),
                }
    except Exception as e:
        print(f"[analytics] Failed to fetch website stats: {e}")
    return {"total_visitors": 0, "total_pageviews": 0}


async def get_referrers(period_days: int = 30) -> list:
    end_at = int(time.time() * 1000)
    start_at = end_at - (period_days * 24 * 60 * 60 * 1000)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.umami_api_url}/websites/{settings.umami_website_id}/metrics",
                headers=UMAMI_HEADERS,
                params={"startAt": start_at, "endAt": end_at, "type": "referrer", "limit": 10},
            )
            if response.status_code == 200:
                return [
                    {"source": item.get("x", "Direct"), "visitors": item.get("y", 0)}
                    for item in response.json()
                ]
    except Exception as e:
        print(f"[analytics] Failed to fetch referrers: {e}")
    return []


async def get_devices(period_days: int = 30) -> list:
    end_at = int(time.time() * 1000)
    start_at = end_at - (period_days * 24 * 60 * 60 * 1000)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.umami_api_url}/websites/{settings.umami_website_id}/metrics",
                headers=UMAMI_HEADERS,
                params={"startAt": start_at, "endAt": end_at, "type": "device", "limit": 10},
            )
            if response.status_code == 200:
                return [
                    {"device": item.get("x", "Unknown"), "count": item.get("y", 0)}
                    for item in response.json()
                ]
    except Exception as e:
        print(f"[analytics] Failed to fetch devices: {e}")
    return []


async def get_countries(period_days: int = 30) -> list:
    end_at = int(time.time() * 1000)
    start_at = end_at - (period_days * 24 * 60 * 60 * 1000)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.umami_api_url}/websites/{settings.umami_website_id}/metrics",
                headers=UMAMI_HEADERS,
                params={"startAt": start_at, "endAt": end_at, "type": "country", "limit": 20},
            )
            if response.status_code == 200:
                return [
                    {"country": item.get("x", "Unknown"), "visitors": item.get("y", 0)}
                    for item in response.json()
                ]
    except Exception as e:
        print(f"[analytics] Failed to fetch countries: {e}")
    return []
