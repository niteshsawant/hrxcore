from fastapi import APIRouter

from .health import router as health_router
from .orgs import router as orgs_router
from .users.router import router as users_router

router = APIRouter()

router.include_router(health_router)
router.include_router(orgs_router)
router.include_router(users_router)
