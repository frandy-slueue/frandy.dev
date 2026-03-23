"""
Run this once to create the admin user in the database.

Usage:
    cd backend
    source .venv/bin/activate
    python scripts/seed_admin.py
"""

import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from core.config import settings
from core.security import hash_password
from models.admin_user import AdminUser


async def seed_admin():
    engine = create_async_engine(settings.database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        result = await session.execute(
            select(AdminUser).where(AdminUser.username == "frandy")
        )
        existing = result.scalar_one_or_none()

        if existing:
            print("Admin user already exists — skipping.")
            await engine.dispose()
            return

        admin = AdminUser(
            username="frandy",
            hashed_password=hash_password("changeme"),
        )
        session.add(admin)
        await session.commit()
        print("Admin user created: username=frandy password=changeme")
        print("IMPORTANT: Change this password immediately after first login.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_admin())
