from datetime import date

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from app.core.security import get_current_user
from app.schemas.common import TaskStatus
from app.schemas.task import Task, TaskUpdate
from app.schemas.user import AuthenticatedUser
from app.services.dashboard_service import DailyPlanService

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskReschedule(BaseModel):
    scheduled_date: date
    estimated_minutes: int | None = None


@router.patch("/{task_id}/status", response_model=Task)
def update_task_status(
    task_id: str,
    payload: TaskStatusUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Task:
    return DailyPlanService().update_task_status(task_id, current_user.uid, payload.status)


@router.patch("/{task_id}", response_model=Task)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Task:
    return DailyPlanService().update_task_details(task_id, current_user.uid, payload)


@router.post("/{task_id}/reschedule", response_model=Task)
def reschedule_task(
    task_id: str,
    payload: TaskReschedule,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Task:
    return DailyPlanService().reschedule_task(task_id, current_user.uid, payload.scheduled_date, payload.estimated_minutes)


@router.post("/{task_id}/complete", response_model=Task)
def complete_task(
    task_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Task:
    return DailyPlanService().update_task_status(task_id, current_user.uid, TaskStatus.COMPLETED)


@router.post("/{task_id}/skip", response_model=Task)
def skip_task(
    task_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Task:
    return DailyPlanService().update_task_status(task_id, current_user.uid, TaskStatus.SKIPPED)


@router.post("/{task_id}/start", response_model=Task)
def start_task(
    task_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Task:
    return DailyPlanService().update_task_status(task_id, current_user.uid, TaskStatus.IN_PROGRESS)


@router.post("/{task_id}/adapt", response_model=dict)
def adapt_plan_after_task_change(
    task_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    from app.services.adaptive_planning_service import AdaptivePlanningService
    
    task = DailyPlanService().task_repository.get_task(task_id, current_user.uid)
    if not task:
        from app.core.errors import not_found
        raise not_found("Task not found")
    
    adaptive_service = AdaptivePlanningService()
    return adaptive_service.adapt_plan_after_task_change(
        task.mission_id, current_user.uid, task_id, task.status
    )
