from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.common import MilestoneStatus, utc_now


class MilestoneBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    order_index: int = Field(default=0, ge=0)


class MilestoneCreate(MilestoneBase):
    mission_id: str


class MilestoneUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    status: MilestoneStatus | None = None
    order_index: int | None = Field(default=None, ge=0)


class Milestone(MilestoneBase):
    id: str
    user_id: str
    mission_id: str
    status: MilestoneStatus = MilestoneStatus.PENDING
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

