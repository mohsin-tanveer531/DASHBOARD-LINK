# backend/test_db.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings  # if you want to pull from .env

# Either hard-code or import from settings
DATABASE_URL = settings.database_url  
# Or: "postgresql+asyncpg://postgres:<YourPassword>@localhost:5432/crm_db"

async def test_conn():
    engine = create_async_engine(DATABASE_URL, echo=True, future=True)
    async with engine.connect() as conn:
        # wrap the raw SQL in text()
        result = await conn.execute(text("SELECT 1"))
        print("Database responded:", result.scalar_one())

asyncio.run(test_conn())
