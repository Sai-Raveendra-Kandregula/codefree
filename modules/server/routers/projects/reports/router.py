from fastapi import APIRouter, Depends

from modules.server.SessionAuthenticator import auth_required
from modules.server.routers.projects.reports.base import reportsBaseRouter
from modules.server.routers.projects.reports.report_specific import reportSpecificRouter

reportsRouter = APIRouter(
    dependencies=[Depends(auth_required)],
    prefix="/report"
)

reportsRouter.include_router(reportsBaseRouter)
reportsRouter.include_router(reportSpecificRouter)
