from fastapi import APIRouter

from .health import router as health_router
# from .orgs import router as orgs_router
# from .users.router import router as users_router
from .chro import router as chro_router

from .endpoints import users as users_endpoints
from .endpoints import interventions as interventions_endpoints

from .endpoints import portfolio as portfolio_endpoints

router = APIRouter()

router.include_router(health_router)
# router.include_router(orgs_router)
# router.include_router(users_router)
router.include_router(chro_router)

router.include_router(users_endpoints.router, prefix="/users", tags=["users"])
router.include_router(interventions_endpoints.router, prefix="/interventions", tags=["interventions"])
# Submissions endpoint removed as part of refactor
router.include_router(portfolio_endpoints.router, prefix="/portfolio", tags=["portfolio"])

from .endpoints import workflow as workflow_endpoints
router.include_router(workflow_endpoints.router, prefix="/workflow", tags=["workflow"])

from .endpoints import ai_coach as ai_coach_endpoints
router.include_router(ai_coach_endpoints.router, tags=["ai-coach"])

from .endpoints import profile as profile_endpoints
router.include_router(profile_endpoints.router, tags=["profile"])

from .endpoints import auth as auth_endpoints
router.include_router(auth_endpoints.router, prefix="/auth", tags=["auth"])
