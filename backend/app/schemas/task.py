from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.common import TaskPriority, TaskStatus, utc_now


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    scheduled_date: date | None = None
    estimated_minutes: int | None = Field(default=None, ge=5, le=720)
    priority: TaskPriority = TaskPriority.MEDIUM
    rationale: str | None = Field(default=None, max_length=2000)
    order_index: int = Field(default=0, ge=0)


class TaskCreate(TaskBase):
    mission_id: str
    milestone_id: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    scheduled_date: date | None = None
    estimated_minutes: int | None = Field(default=None, ge=5, le=720)
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    rationale: str | None = Field(default=None, max_length=2000)
    order_index: int | None = Field(default=None, ge=0)
    completed_at: datetime | None = None


class Task(TaskBase):
    id: str
    user_id: str
    mission_id: str
    milestone_id: str | None = None
    status: TaskStatus = TaskStatus.PENDING
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
