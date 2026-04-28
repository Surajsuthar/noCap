from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    first_name: str | None
    last_name: str | None
    email: str
    email_verified: bool
    age: int | None
