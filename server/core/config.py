from pydentic_settings import BaseSettings


class Settings(BaseSettings):
	DATABASE_URL: str
	REDIS_URL: str
	SECRET: str
	GOOGLE_CLIENT_ID: str = ""
	GOOGLE_CLIENT_SECRET: str = ""
	GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
	POLAR_ACCESS_TOKEN: str = ""

	class Config:
		env_file = ".env"

config = Settings()
