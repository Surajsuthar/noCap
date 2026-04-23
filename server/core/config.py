from pydentic_settings import BaseSettings


class Settings(BaseSettings):
	DATABASE_URL: str
	REDIS_URL: str
	SECRET: str

	class Config:
		env_file = ".env"

config = Settings()
