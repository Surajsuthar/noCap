from fastapi import APIRouter

from core.auth.router import user_router

router = APIRouter(prefix="v1", tags=["main"])

router.include_router(user_router)
