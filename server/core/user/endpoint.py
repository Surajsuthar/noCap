from typing import Annotated

from fastapi import APIRouter, Depends

from core.user.schemas import UserResponse
from core.user.service import UserService
from dependencies import CurrentUser

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service() -> UserService:
    return UserService()


UserServiceDep = Annotated[UserService, Depends(get_user_service)]


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently authenticated user",
)
async def get_me(
    current_user: CurrentUser,
    service: UserServiceDep,
) -> UserResponse:
    return await service.get_me(current_user)
