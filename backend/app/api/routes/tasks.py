from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas.common import TaskStatus
from app.schemas.task import Task
from app.schemas.user import AuthenticatedUser
from app.services.dashboard_service import DailyPlanService
from pydantic import BaseModel

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


@router.patch("/{task_id}/status", response_model=Task)
def update_task_status(
    task_id: str,
    payload: TaskStatusUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Task:
    return DailyPlanService().update_task_status(task_id, current_user.uid, payload.status)
