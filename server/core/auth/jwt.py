from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

ALGORITHM="HS256"
ACCESS_EXPIRE_MINUTES=60 * 24
REFRESH_EXPIRE_DAYS=30

class JWT:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key

    def create_access_token(self, data: dict):
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_EXPIRE_MINUTES)
        to_encode = {**data, "exp": expire}
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=ALGORITHM)
        return encoded_jwt

    def create_refresh_token(self, data: dict):
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS)
        to_encode = {**data, "exp": expire}
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=ALGORITHM)
        return encoded_jwt

    def decode_token(self, token: str):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
