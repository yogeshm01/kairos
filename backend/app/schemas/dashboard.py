from datetime import date

from pydantic import BaseModel, Field

from app.schemas.common import RiskLevel
from app.schemas.daily_plan import DailyPlan
from app.schemas.milestone import Milestone
from app.schemas.mission import Mission
from app.schemas.reflection import Reflection
from app.schemas.task import Task


class MissionProgress(BaseModel):
    completion_rate: float = Field(ge=0, le=1)
    completed_tasks: int = Field(ge=0)
    total_tasks: int = Field(ge=0)
    completed_milestones: int = Field(ge=0)
    total_milestones: int = Field(ge=0)
    days_remaining: int


class DashboardTask(BaseModel):
    task: Task
    why_it_matters: str | None = None


class MissionDashboard(BaseModel):
    mission: Mission
    progress: MissionProgress
    confidence_score: int = Field(ge=0, le=100)
    confidence_trend: str
    risk_level: RiskLevel
    deadline_risk_score: int = Field(ge=0, le=100)
    next_best_action: str
    ai_suggestions: list[str] = Field(default_factory=list)
    todays_plan: DailyPlan | None = None
    todays_tasks: list[DashboardTask] = Field(default_factory=list)
    upcoming_milestones: list[Milestone] = Field(default_factory=list)
    recent_reflections: list[Reflection] = Field(default_factory=list)


class MissionToday(BaseModel):
    mission: Mission
    plan_date: date
    daily_plan: DailyPlan | None = None
    tasks: list[DashboardTask] = Field(default_factory=list)
    next_best_action: str
    estimated_minutes: int = Field(ge=0)


class MissionRiskResponse(BaseModel):
    mission_id: str
    risk_level: RiskLevel
    deadline_risk_score: int = Field(ge=0, le=100)
    risk_factors: list[str] = Field(default_factory=list)
    mitigations: list[str] = Field(default_factory=list)
    summary: str
