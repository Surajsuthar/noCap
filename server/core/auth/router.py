from fastapi import APIRouter, Depends, Header, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from server.core.auth.schemas import (
    AuthResponse,
    LoginRequest,
    OAuthLoginRequest,
    ProviderSlug,
    RefreshTokenRequest,
    RegisterRequest,
    UserOut,
)
from server.core.auth.service import AuthService
from server.core.database import get_db

user_router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(db)


@user_router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(
    payload: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    return await auth_service.register(payload)


@user_router.post("/login", response_model=AuthResponse)
async def login_user(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    return await auth_service.login(payload)


@user_router.post("/refresh", response_model=AuthResponse)
async def refresh_session(
    payload: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    return await auth_service.refresh(payload.refresh_token)


@user_router.post("/oauth/{provider}", response_model=AuthResponse)
async def login_with_oauth(
    payload: OAuthLoginRequest,
    provider: ProviderSlug = Path(...),
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthResponse:
    return await auth_service.oauth_login(provider, payload)


@user_router.get("/me", response_model=UserOut)
async def get_current_user(
    authorization: str = Header(..., alias="Authorization"),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserOut:
    return await auth_service.get_current_user(authorization)


@user_router.post("/logout")
async def logout_user() -> dict[str, str]:
    return {"message": "Logout is handled client-side until token revocation is added."}
