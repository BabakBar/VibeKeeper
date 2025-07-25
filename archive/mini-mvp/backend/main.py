"""FastAPI application entry point for VibeKeeper."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    from database import create_tables
    await create_tables()
    yield
    # On shutdown
    pass


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

    # Allow local frontend (Nuxt dev server on port 3000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers under /api
    app.include_router(api_router, prefix="/api")

    @app.get("/health")
    async def health_check():
        return {"status": "ok"}

    return app


app = create_app()
