from datetime import date

from pydantic.fields import Field
from pydantic_settings import BaseSettings

from core.auth.utils import calculate_age


class CredintialRegister(BaseSettings):
    first_name: str
    last_namr: str
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)
    dob: date
    email: str

    @classmethod
    def verify_password(cls, password: str, confirm_password: str) -> bool:
        return password == confirm_password

    @classmethod
    def verify_age(cls, dob: date) -> bool:
        return calculate_age(dob) >= 18

class CredintialLogin(BaseSettings):
    email: str
    password: str = Field(min_length=8)
