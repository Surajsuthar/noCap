from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth.schemas import CredintialRegister
from database.db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
async def register(user: CredintialRegister, session: AsyncSession = Depends(get_db)):
    pass

@router.post("/login")
async def login(session: AsyncSession = Depends(get_db)):
    pass

@router.post("/logout")
async def logout(session: AsyncSession = Depends(get_db)):
    pass
