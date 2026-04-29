# middleware/rate_limit.py
import logging
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from upstash_ratelimit.asyncio import Ratelimit, SlidingWindow

from config import config
from redis_client import redis_client

logger = logging.getLogger(__name__)

WHITELIST_IPS: set[str] = {"127.0.0.1", "localhost"}

ROUTE_LIMITERS: dict[str, Ratelimit] = {
    "/api/auth/signup": Ratelimit(
        redis=redis_client.client,
        limiter=SlidingWindow(max_requests=5, window=60),
        prefix="rl:auth",
    ),
    "/api/auth/login": Ratelimit(
        redis=redis_client.client,
        limiter=SlidingWindow(max_requests=20, window=60),
        prefix="rl:auth",
    ),
}

DEFAULT_LIMITER = Ratelimit(
    redis=redis_client.client,
    limiter=SlidingWindow(max_requests=100, window=60),
    prefix="rl:default",
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = self._get_client_ip(request)

        if client_ip in WHITELIST_IPS:
            return await call_next(request)

        limiter = self._get_limiter(request.url.path)

        try:
            result = await limiter.limit(client_ip)
        except Exception as e:
            logger.error(f"Rate limit error: {e}")
            return await call_next(request)  # fail open

        if not result.allowed:
            return JSONResponse(
                status_code=429,
                headers={
                    "X-RateLimit-Limit":     str(result.limit),
                    "X-RateLimit-Remaining": str(result.remaining),
                    "X-RateLimit-Reset":     str(result.reset),
                    "Retry-After":           str(result.reset),
                },
                content={
                    "error": "Too Many Requests",
                    "retry_after": result.reset,
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"]     = str(result.limit)
        response.headers["X-RateLimit-Remaining"] = str(result.remaining)
        response.headers["X-RateLimit-Reset"]     = str(result.reset)
        return response

    def _get_limiter(self, path: str) -> Ratelimit:
        for prefix, limiter in ROUTE_LIMITERS.items():
            if path.startswith(prefix):
                return limiter
        return DEFAULT_LIMITER


    @staticmethod
    def _get_client_ip(request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
