"""Package that groups all FastAPI routers."""

from fastapi import APIRouter

# from .auth import router as auth_router
from .occasions import router as occasions_router


api_router = APIRouter()

# Mount under /api prefix inside main.py

# api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(occasions_router, prefix="/occasions", tags=["occasions"])
