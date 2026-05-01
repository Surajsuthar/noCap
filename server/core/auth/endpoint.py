from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from config import config
from core.auth.schemas import (
    AccessTokenResponse,
    CallbackRequest,
    CredintialLogin,
    CredintialRegister,
    LogoutResponse,
    MagicLinkRequest,
    MagicLinkResponse,
    RefreshRequest,
    TokenPairResponse,
)
from core.auth.service import AuthService
from database.db import get_db
from lib.utils.response import APIResponse

router = APIRouter(prefix="/auth", tags=["auth"])

ACCESS_TOKEN_COOKIE = "nocap_access_token"
REFRESH_TOKEN_COOKIE = "nocap_refresh_token"
ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24
REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30

def get_auth_service() -> AuthService:
    return AuthService()


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


def set_session_cookies(response: Response, token_pair: TokenPairResponse) -> None:
    secure = config.ENVIRONMENT == "prod"
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=token_pair.access_token,
        max_age=ACCESS_TOKEN_MAX_AGE,
        httponly=True,
        secure=secure,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=token_pair.refresh_token,
        max_age=REFRESH_TOKEN_MAX_AGE,
        httponly=True,
        secure=secure,
        samesite="lax",
        path="/",
    )


@router.post(
    "/signup",
    response_model=APIResponse[MagicLinkResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user and send a magic link",
)
async def register(
    payload: CredintialRegister,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> APIResponse[MagicLinkResponse]:
    data = await service.register(payload, session)
    return APIResponse(
        success=True,
        message="User registered successfully. Check your email to continue.",
        data=data,
    )



@router.post(
    "/login",
    response_model=APIResponse[MagicLinkResponse],
    status_code=status.HTTP_200_OK,
    summary="Send a sign-in magic link",
    # 10 attempts per 15 minutes per IP — brute-force protection.
    # dependencies=[rate_limit(10, 900, namespace="auth:login")],
)
async def login(
    payload: CredintialLogin,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> APIResponse[MagicLinkResponse]:
    data = await service.login(payload, session)
    return APIResponse(success=True, message=data.message, data=data)


@router.post(
    "/magic-link",
    response_model=APIResponse[MagicLinkResponse],
    status_code=status.HTTP_200_OK,
    summary="Send a magic link to an existing user",
)
async def magic_link(
    payload: MagicLinkRequest,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> APIResponse[MagicLinkResponse]:
    data = await service.generate_verification_email(payload.email, session)
    return APIResponse(success=True, message=data.message, data=data)


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
) -> APIResponse[AccessTokenResponse]:
    data = await service.refresh(payload.refresh_token, session)
    return APIResponse(success=True, message="Access token refreshed.", data=data)


@router.post(
    "/resend",
    response_model=APIResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Resend the verification email",
)
async def resend_verification(
    payload: MagicLinkRequest,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> APIResponse[MagicLinkResponse]:
    data = await service.generate_verification_email(payload.email, session)
    return APIResponse(success=True, message=data.message, data=data)


@router.post(
    "/callback",
    response_model=APIResponse[TokenPairResponse],
    status_code=status.HTTP_200_OK,
    summary="Consume a magic link token",
)
async def callback(
    payload: CallbackRequest,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> APIResponse[TokenPairResponse]:
    data = await service.callback(payload.token, session)
    return APIResponse(success=True, message="Authenticated successfully.", data=data)


@router.get(
    "/callback/",
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    summary="Verify a magic link, create a session, and redirect to the client",
)
async def callback_from_magic_link(
    token: Annotated[str, Query(min_length=1)],
    session: DatabaseSession,
    service: AuthServiceDep,
) -> RedirectResponse:
    token_pair = await service.callback(token, session)
    response = RedirectResponse(
        url=config.MAGIC_LINK_CLIENT_REDIRECT_URL,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )
    set_session_cookies(response, token_pair)
    return response


@router.post(
    "/logout",
    response_model=APIResponse[LogoutResponse],
    status_code=status.HTTP_200_OK,
    summary="Invalidate the current session (client-side token discard)",
    # No rate limit — logout is stateless and low-cost.
)
async def logout(response: Response) -> APIResponse[LogoutResponse]:
    # Tokens are stateless JWTs; instruct the client to discard them.
    # Add a Redis deny-list here if server-side revocation is ever required.
    response.delete_cookie(ACCESS_TOKEN_COOKIE, path="/")
    response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/")
    data = LogoutResponse(
        message="Logged out successfully. Discard your access and refresh tokens."
    )
    return APIResponse(success=True, message=data.message, data=data)
