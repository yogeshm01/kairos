from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.common import RiskLevel, utc_now


class DailyPlanBase(BaseModel):
    plan_date: date
    focus: str = Field(min_length=1, max_length=240)
    summary: str | None = Field(default=None, max_length=2000)
    task_ids: list[str] = Field(default_factory=list)
    estimated_minutes: int = Field(default=0, ge=0, le=1440)
    risk_level: RiskLevel = RiskLevel.MEDIUM
    coach_message: str | None = Field(default=None, max_length=1200)


class DailyPlanCreate(DailyPlanBase):
    mission_id: str


class DailyPlanUpdate(BaseModel):
    focus: str | None = Field(default=None, min_length=1, max_length=240)
    summary: str | None = Field(default=None, max_length=2000)
    task_ids: list[str] | None = None
    estimated_minutes: int | None = Field(default=None, ge=0, le=1440)
    risk_level: RiskLevel | None = None
    coach_message: str | None = Field(default=None, max_length=1200)


class DailyPlan(DailyPlanBase):
    id: str
    user_id: str
    mission_id: str
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

