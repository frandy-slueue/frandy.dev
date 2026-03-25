from pydantic import BaseModel


class PublicStatsResponse(BaseModel):
    visitor_count: int


class PageViewsResponse(BaseModel):
    section: str
    views: int


class ReferrerResponse(BaseModel):
    source: str
    visitors: int


class DeviceResponse(BaseModel):
    device: str
    count: int


class CountryResponse(BaseModel):
    country: str
    visitors: int


class FullAnalyticsResponse(BaseModel):
    total_visitors: int
    total_pageviews: int
    referrers: list[ReferrerResponse]
    devices: list[DeviceResponse]
    countries: list[CountryResponse]
