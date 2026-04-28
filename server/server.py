from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import config
from core.health.endpoint import router as health_router
from rate_limit import RateLimitMiddleware
from routes import router as api_router


def add_cors_middleware(app: FastAPI) -> None:
    if not config.CORS_ORIGINS:
        return

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def create_app() -> FastAPI:
    app = FastAPI(
        description="noCap backend API"
    )
    add_cors_middleware(app)
    app.add_middleware(RateLimitMiddleware)
    app.include_router(health_router)
    app.include_router(api_router)
    return app


app = create_app()
