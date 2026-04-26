from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.core.config import config
from server.core.database import Base, get_engine
from server.core.route import router


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with get_engine().begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="NoCap API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "NoCap server is running."}
