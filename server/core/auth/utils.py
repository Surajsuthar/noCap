from datetime import date, datetime, timezone

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def calculate_age(date_of_birth: date) -> int:
    today = datetime.now(timezone.utc).date()
    years = today.year - date_of_birth.year
    before_birthday = (today.month, today.day) < (date_of_birth.month, date_of_birth.day)
    return years - int(before_birthday)

class Hasher:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)
