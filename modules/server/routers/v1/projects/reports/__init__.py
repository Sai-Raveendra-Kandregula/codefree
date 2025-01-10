from fastapi import APIRouter, Depends

from modules.server.SessionAuthenticator import auth_required
from .base import reportsBaseRouter
from .report_specific import reportSpecificRouter

reportsRouter = APIRouter(
    dependencies=[Depends(auth_required)],
    prefix="/report"
)

reportsRouter.include_router(reportsBaseRouter)
reportsRouter.include_router(reportSpecificRouter)
