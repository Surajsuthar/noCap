import logging
from typing import Annotated

from fastapi import APIRouter, Body, Depends, Query, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from config import config
from core.auth.schemas import (
    AccessTokenResponse,
    CredintialLogin,
    CredintialRegister,
    LoginResponse,
    LogoutResponse,
    MagicLinkRequest,
    MagicLinkResponse,
    OTPRequest,
    RefreshRequest,
)
from core.auth.service import AuthService
from core.auth.utils import (
    ACCESS_TOKEN_COOKIE,
    OAUTH_STATE_COOKIE,
    OAUTH_STATE_MAX_AGE,
    REFRESH_TOKEN_COOKIE,
    set_access_token_cookie,
    set_session_cookies,
)
from database.db import get_db
from lib.utils.response import APIResponse, error_response, success_response

router = APIRouter(prefix="/auth", tags=["auth"])



def get_auth_service() -> AuthService:
    return AuthService()


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]

logger = logging.getLogger(__name__)

@router.post(
    "/signup",
    response_model=APIResponse[None],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user and send a magic link",
)
async def register(
    payload: CredintialRegister,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> APIResponse[None]:
    try:
        await service.register(payload, session)
    except Exception as e:
        return error_response(message=str(e))

    return success_response(message="User registered successfully. Check your email to continue.")


@router.get(
    "/callback/",
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    summary="Verify a magic link, create a session, and redirect to the client",
)
async def callback_from_magic_link(
    token: Annotated[str, Query(min_length=1)],
    session: DatabaseSession,
    service: AuthServiceDep,
    request: Request,
) -> RedirectResponse:
    token_pair = await service.callback(token, request, session)

    if not token_pair:
        return RedirectResponse(
            url=config.MAGIC_LINK_CLIENT_REDIRECT_URL,
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )

    response = RedirectResponse(
        url=config.MAGIC_LINK_CLIENT_REDIRECT_URL,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )
    set_session_cookies(response, token_pair)
    return response


@router.post(
    "/login",
    response_model=APIResponse[LoginResponse],
    status_code=status.HTTP_200_OK,
    summary="Login with email and verified user generated OTP",
    # 10 attempts per 15 minutes per IP — brute-force protection.
    # dependencies=[rate_limit(10, 900, namespace="auth:login")],
)
async def login(
    payload: CredintialLogin,
    session: DatabaseSession,
    service: AuthServiceDep,
    request: Request,
) -> APIResponse[LoginResponse]:
    try:
        user_id = await service.login(payload, request, session)
        return APIResponse(success=True, message="Login successfully", data=LoginResponse(request_id=user_id))
    except Exception:
        return error_response(message="Login failed")

@router.post(
    "/otp-verify",
    response_model=APIResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Verify login OTP",
)
async def verify_login_otp(
    payload: OTPRequest,
    session: DatabaseSession,
    service: AuthServiceDep,
    request: Request,
    response: Response,
) -> APIResponse[None]:
    try:
        token_pair = await service.verify_otp(
            identifier=payload.identifier,
            request=request,
            otp=payload.otp,
            session=session,
        )
        set_session_cookies(response, token_pair)
        return success_response(message="Login successfully")
    except Exception:
        return error_response(message="Login failed")


@router.post(
    "/refresh",
    response_model=APIResponse[AccessTokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Exchange a valid refresh token for a new access token",
    # 30 refreshes per 5 minutes per IP — generous for normal use,
    # but stops token-hammering from a single origin.
)
async def refresh(
    session: DatabaseSession,
    service: AuthServiceDep,
    request: Request,
    response: Response,
    payload: Annotated[RefreshRequest | None, Body()] = None,
) -> APIResponse[AccessTokenResponse]:
    refresh_token = (payload.refresh_token if payload else None) or request.cookies.get(REFRESH_TOKEN_COOKIE)
    if not refresh_token:
        return error_response(message="Refresh token is required")

    data = await service.refresh(refresh_token, session)
    set_access_token_cookie(response, data.access_token)
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
    try:
        data = await service.generate_verification_email(payload.email, session)
        return APIResponse(success=True, message=data.message )
    except Exception as e:
        return APIResponse(success=False, message="Failed to resend verification email", error=str(e))


# @router.post(
#     "/callback",
#     response_model=APIResponse[TokenPairResponse],
#     status_code=status.HTTP_200_OK,
#     summary="Consume a magic link token",
# )
# async def callback(
#     payload: CallbackRequest,
#     session: DatabaseSession,
#     service: AuthServiceDep,
# ) -> APIResponse[TokenPairResponse]:
#     data = await service.callback(payload.token, session)
#     return APIResponse(success=True, message="Authenticated successfully.", data=data)


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
    return APIResponse(success=True, message="Logged out successfully.")


# @router.post(
#     "/oauth2/google",
#     response_model=APIResponse[TokenPairResponse],
#     status_code=status.HTTP_200_OK,
#     summary="Authenticate via Google OAuth2",
# )
# async def oauth2_google(
#     code: Annotated[str, Query(min_length=1)],
#     session: DatabaseSession,
#     service: AuthServiceDep,
# ) -> APIResponse[TokenPairResponse]:
#     data = await service.exchange_google_code(code=code, session=session)
#     return APIResponse(success=True, message="Authenticated successfully.", data=data)

@router.get(
    "/oauth2/google",
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    summary="Redirect to Google OAuth2 login",
)
async def oauth2_google_redirect(service: AuthServiceDep) -> RedirectResponse:
    state = service.create_oauth_state()
    response = RedirectResponse(
        url=service.build_google_authorization_url(state),
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )
    response.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        max_age=OAUTH_STATE_MAX_AGE,
        httponly=True,
        secure=config.ENVIRONMENT == "prod",
        samesite="lax",
        path="/",
    )
    return response


@router.get(
    "/oauth2/callback/google",
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    summary="Handle the Google OAuth2 callback",
)
async def oauth2_google_callback(
    code: Annotated[str, Query(min_length=1)],
    state: Annotated[str, Query(min_length=1)],
    request: Request,
    session: DatabaseSession,
    service: AuthServiceDep,
) -> RedirectResponse:
    service.validate_oauth_state(state, request.cookies.get(OAUTH_STATE_COOKIE))
    token_pair = await service.exchange_google_code(code=code, request=request, session=session)
    redirect = RedirectResponse(
        url=config.MAGIC_LINK_CLIENT_REDIRECT_URL,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )
    set_session_cookies(redirect, token_pair)
    redirect.delete_cookie(OAUTH_STATE_COOKIE, path="/")
    return redirect
