from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth.schemas import (
    AccessTokenResponse,
    CredintialLogin,
    CredintialRegister,
    LogoutResponse,
    RefreshRequest,
    TokenPairResponse,
)
from core.auth.service import AuthService
from database.db import get_db
from lib.utils.response import APIResponse

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service() -> AuthService:
    return AuthService()


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]

@router.post(
    "/signup",
    response_model=APIResponse[TokenPairResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user and receive a token pair",
)
async def register(
    payload: CredintialRegister,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> TokenPairResponse:
    return await service.register(payload, session)


@router.post(
    "/login",
    response_model=APIResponse[TokenPairResponse],
    status_code=status.HTTP_200_OK,
    summary="Authenticate with email + password and receive a token pair",
    # 10 attempts per 15 minutes per IP — brute-force protection.
    # dependencies=[rate_limit(10, 900, namespace="auth:login")],
)
async def login(
    payload: CredintialLogin,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> TokenPairResponse:
    return await service.login(payload, session)


@router.post(
    "/refresh",
    response_model=APIResponse[AccessTokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Exchange a valid refresh token for a new access token",
    # 30 refreshes per 5 minutes per IP — generous for normal use,
    # but stops token-hammering from a single origin.
)
async def refresh(
    payload: RefreshRequest,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> AccessTokenResponse:
    return await service.refresh(payload.refresh_token, session)


@router.post(
    "/resend",
    response_model=APIResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Resend the verification email",
)
async def resend_verification(
) -> None:
    pass


@router.post(
    "/logout",
    response_model=APIResponse[LogoutResponse],
    status_code=status.HTTP_200_OK,
    summary="Invalidate the current session (client-side token discard)",
    # No rate limit — logout is stateless and low-cost.
)
async def logout() -> LogoutResponse:
    # Tokens are stateless JWTs; instruct the client to discard them.
    # Add a Redis deny-list here if server-side revocation is ever required.
    return LogoutResponse(
        message="Logged out successfully. Discard your access and refresh tokens."
    )
