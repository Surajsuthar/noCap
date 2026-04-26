from fastapi import APIRouter

from server.core.auth.router import user_router

router = APIRouter(prefix="/v1")
router.include_router(user_router)
