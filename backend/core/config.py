from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    resend_api_key: str
    contact_email: str
    github_token: str
    github_username: str
    umami_api_url: str
    umami_api_key: Optional[str] = None
    umami_website_id: str
    upload_dir: str = "./uploads"

    class Config:
        env_file = ".env"


settings = Settings()
