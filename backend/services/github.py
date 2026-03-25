from datetime import datetime, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models.github_cache import GithubCache

GITHUB_API = "https://api.github.com"
HEADERS = {
    "Authorization": f"Bearer {settings.github_token}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


async def fetch_total_commits(client: httpx.AsyncClient) -> int:
    """Fetch total commit count across all repos."""
    total = 0
    page = 1
    while True:
        response = await client.get(
            f"{GITHUB_API}/search/commits",
            headers={**HEADERS, "Accept": "application/vnd.github.cloak-preview+json"},
            params={"q": f"author:{settings.github_username}", "per_page": 1, "page": page},
        )
        if response.status_code == 200:
            total = response.json().get("total_count", 0)
            break
        break
    return total


async def fetch_languages(client: httpx.AsyncClient) -> dict:
    """Fetch language usage percentages across all repos."""
    repos_response = await client.get(
        f"{GITHUB_API}/users/{settings.github_username}/repos",
        headers=HEADERS,
        params={"per_page": 100, "type": "owner"},
    )
    if repos_response.status_code != 200:
        return {}

    repos = repos_response.json()
    language_bytes: dict[str, int] = {}

    for repo in repos:
        lang_response = await client.get(
            repo["languages_url"],
            headers=HEADERS,
        )
        if lang_response.status_code == 200:
            for lang, bytes_count in lang_response.json().items():
                language_bytes[lang] = language_bytes.get(lang, 0) + bytes_count

    total = sum(language_bytes.values())
    if total == 0:
        return {}

    return {
        lang: round((count / total) * 100, 1)
        for lang, count in sorted(language_bytes.items(), key=lambda x: x[1], reverse=True)
    }


async def fetch_activity_graph(client: httpx.AsyncClient) -> dict:
    """Fetch contribution activity for the past year."""
    response = await client.get(
        f"{GITHUB_API}/users/{settings.github_username}/events",
        headers=HEADERS,
        params={"per_page": 100},
    )
    if response.status_code != 200:
        return {}

    events = response.json()
    activity: dict[str, int] = {}

    for event in events:
        if event.get("type") == "PushEvent":
            date = event["created_at"][:10]
            commits = len(event.get("payload", {}).get("commits", []))
            activity[date] = activity.get(date, 0) + commits

    return activity


async def fetch_pinned_repos(client: httpx.AsyncClient) -> list:
    """
    Fetch pinned repositories using GraphQL API.
    Falls back to top starred repos if GraphQL fails.
    """
    query = """
    {
      user(login: "%s") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              pushedAt
              languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
                nodes { name }
              }
            }
          }
        }
      }
    }
    """ % settings.github_username

    response = await client.post(
        "https://api.github.com/graphql",
        headers=HEADERS,
        json={"query": query},
    )

    if response.status_code == 200:
        data = response.json()
        nodes = (
            data.get("data", {})
            .get("user", {})
            .get("pinnedItems", {})
            .get("nodes", [])
        )
        return [
            {
                "name": repo["name"],
                "description": repo.get("description"),
                "url": repo["url"],
                "stars": repo["stargazerCount"],
                "last_commit": repo.get("pushedAt"),
                "languages": [
                    lang["name"]
                    for lang in repo.get("languages", {}).get("nodes", [])
                ],
            }
            for repo in nodes
        ]

    return []


async def refresh_github_cache(db: AsyncSession) -> GithubCache:
    """
    Fetch all GitHub stats and update the cache in PostgreSQL.
    Called by the scheduler every 3 hours and by the force-refresh endpoint.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        total_commits = await fetch_total_commits(client)
        languages = await fetch_languages(client)
        activity_graph = await fetch_activity_graph(client)
        pinned_repos = await fetch_pinned_repos(client)

    result = await db.execute(select(GithubCache).where(GithubCache.id == 1))
    cache = result.scalar_one_or_none()

    if cache:
        cache.total_commits = total_commits
        cache.languages = languages
        cache.activity_graph = activity_graph
        cache.pinned_repos = pinned_repos
        cache.last_updated = datetime.now(timezone.utc)
    else:
        cache = GithubCache(
            id=1,
            total_commits=total_commits,
            languages=languages,
            activity_graph=activity_graph,
            pinned_repos=pinned_repos,
            last_updated=datetime.now(timezone.utc),
        )
        db.add(cache)

    await db.commit()
    await db.refresh(cache)
    return cache
