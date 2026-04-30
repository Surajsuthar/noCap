from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from redis_client import RedisClient, get_redis_client

router = APIRouter(tags=["health"], include_in_schema=False)

@router.get("/health")
async def health(
    session: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis_client),
) -> dict[str, str]:
    try:
        await session.execute(select(1))
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database is not available") from e

    try:
        if await redis.client.ping() != "PONG":
            raise HTTPException(status_code=500, detail="Redis is not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Redis is not available") from e

    return {"status": "ok"}
