from fastapi import APIRouter

user_router = APIRouter(prefix="/auth", tags=["auth"])


@user_router.post("/register")
async def register_user():
    pass

@user_router.post("/login")
async def login_user():
    pass

@user_router.post("/logout")
async def logout_user():
    pass

@user_router.post("/google")
async def login_with_google():
    pass
