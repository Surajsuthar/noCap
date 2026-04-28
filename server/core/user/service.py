from core.user.schemas import UserResponse
from models.user import User


class UserService:
    @staticmethod
    def _build_user_response(user: User) -> UserResponse:
        return UserResponse(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            email_verified=user.email_verified,
            age=user.age,
        )

    async def get_me(self, user: User) -> UserResponse:
        return self._build_user_response(user)
