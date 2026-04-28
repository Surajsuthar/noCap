from fastapi import APIRouter

from core.auth.endpoint import router as auth_router
from core.user.endpoint import router as user_router

router = APIRouter(prefix="/api")

router.include_router(auth_router)
router.include_router(user_router)
