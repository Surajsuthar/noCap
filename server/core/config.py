from pydentic_settings import Settings


class Config(Settings):
	DATABASE_URL: str
	REDIS_URL: str
	SECRET: str

	class Config:
		env_file = ".env"

config = Config()
