from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db

router = APIRouter(tags=["health"], include_in_schema=False)

@router.get("/health")
async def health(
    session: AsyncSession = Depends(get_db)
) -> dict[str, str]:
    try:
        await session.execute(select(1))
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database is not available") from e

    return {"status": "ok"}
