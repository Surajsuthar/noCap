from upstash_redis.asyncio import Redis

from config import config


class RedisClient:
    def __init__(self):
        self._redis = Redis(
            url=config.UPSTASH_REDIS_REST_URL,
            token=config.UPSTASH_REDIS_REST_TOKEN,
        )

    @property
    def client(self) -> Redis:
        return self._redis


def get_redis_client() -> RedisClient:
    return redis_client

redis_client = RedisClient()
