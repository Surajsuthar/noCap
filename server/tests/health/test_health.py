from fastapi.testclient import TestClient
from sqlalchemy import Select

from core.health.endpoint import get_db, get_redis_client
from server import app

client = TestClient(app)


class FakeSession:
    async def execute(self, statement: Select):
        return None


class FakeRedis:
    async def ping(self):
        return "PONG"


class FakeRedisClient:
    client = FakeRedis()


async def fake_get_db():
    yield FakeSession()


def fake_get_redis_client():
    return FakeRedisClient()


def test_health():
    app.dependency_overrides[get_db] = fake_get_db
    app.dependency_overrides[get_redis_client] = fake_get_redis_client

    response = client.get("/health", headers={"X-Forwarded-For": "127.0.0.1"})

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
