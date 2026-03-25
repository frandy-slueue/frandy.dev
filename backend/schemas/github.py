from datetime import datetime

from pydantic import BaseModel


class GithubStatsResponse(BaseModel):
    total_commits: int | None
    languages: dict | None
    activity_graph: dict | None
    last_updated: datetime | None

    model_config = {"from_attributes": True}


class GithubPinnedRepo(BaseModel):
    name: str
    description: str | None
    url: str
    stars: int
    last_commit: str | None
    languages: list[str]


class GithubPinnedResponse(BaseModel):
    pinned_repos: list | None
    last_updated: datetime | None

    model_config = {"from_attributes": True}
