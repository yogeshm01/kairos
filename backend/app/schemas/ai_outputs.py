from pydantic import BaseModel, Field

from app.schemas.common import RiskLevel, TaskPriority


class AiMilestoneOutput(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=1000)
    target_day: int = Field(ge=1)
    success_criteria: list[str] = Field(default_factory=list, max_length=8)


class AiTaskOutput(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=1000)
    milestone_title: str = Field(min_length=1, max_length=160)
    suggested_day: int = Field(ge=1)
    estimated_minutes: int = Field(ge=5, le=720)
    priority: TaskPriority
    rationale: str = Field(min_length=1, max_length=1000)


class MissionAnalysisOutput(BaseModel):
    mission_summary: str = Field(min_length=1, max_length=1200)
    success_strategy: str = Field(min_length=1, max_length=1600)
    key_risks: list[str] = Field(default_factory=list, max_length=8)
    assumptions: list[str] = Field(default_factory=list, max_length=8)
    confidence_score: int = Field(ge=0, le=100)
    risk_level: RiskLevel
    next_best_action: str = Field(min_length=1, max_length=280)
    milestones: list[AiMilestoneOutput] = Field(min_length=1, max_length=12)
    tasks: list[AiTaskOutput] = Field(min_length=1, max_length=80)


class PlannerOutput(BaseModel):
    plan_summary: str = Field(min_length=1, max_length=1200)
    adjustments: list[str] = Field(default_factory=list, max_length=8)
    milestones: list[AiMilestoneOutput] = Field(default_factory=list, max_length=12)
    tasks: list[AiTaskOutput] = Field(default_factory=list, max_length=80)


class DailyPlanAiOutput(BaseModel):
    focus: str = Field(min_length=1, max_length=240)
    summary: str = Field(min_length=1, max_length=2000)
    task_titles: list[str] = Field(default_factory=list, max_length=20)
    estimated_minutes: int = Field(ge=0, le=1440)
    risk_level: RiskLevel = RiskLevel.MEDIUM
    coach_message: str | None = Field(default=None, max_length=1200)
    scheduling_notes: list[str] = Field(default_factory=list, max_length=8)


class TaskPriorityUpdate(BaseModel):
    task_title: str = Field(min_length=1, max_length=200)
    priority: TaskPriority
    reason: str = Field(min_length=1, max_length=500)


class PriorityEngineOutput(BaseModel):
    priority_summary: str = Field(min_length=1, max_length=1200)
    task_priorities: list[TaskPriorityUpdate] = Field(default_factory=list, max_length=80)
    next_best_action: str = Field(min_length=1, max_length=280)


class RiskAnalysisOutput(BaseModel):
    risk_level: RiskLevel
    deadline_risk_score: int = Field(ge=0, le=100)
    risk_factors: list[str] = Field(default_factory=list, max_length=8)
    mitigations: list[str] = Field(default_factory=list, max_length=8)
    summary: str = Field(min_length=1, max_length=1200)


class RecoveryDailyPlanOutput(BaseModel):
    focus: str = Field(min_length=1, max_length=240)
    summary: str = Field(min_length=1, max_length=2000)
    task_titles: list[str] = Field(default_factory=list, max_length=20)
    estimated_minutes: int = Field(ge=0, le=1440)


class RecoveryPlanOutput(BaseModel):
    what_changed: str = Field(min_length=1, max_length=1600)
    at_risk_items: list[str] = Field(default_factory=list, max_length=12)
    compressed_items: list[str] = Field(default_factory=list, max_length=12)
    removed_items: list[str] = Field(default_factory=list, max_length=12)
    new_daily_plan: RecoveryDailyPlanOutput
    new_confidence_score: int = Field(ge=0, le=100)
    new_risk_level: RiskLevel
    next_best_action: str = Field(min_length=1, max_length=280)
    recovery_message: str = Field(min_length=1, max_length=1600)


class ReflectionAnalysisOutput(BaseModel):
    ai_insight: str = Field(min_length=1, max_length=1600)
    blocker_patterns: list[str] = Field(default_factory=list, max_length=8)
    confidence_adjustment: int = Field(ge=-20, le=20)
    risk_adjustment: RiskLevel
    recommended_action: str = Field(min_length=1, max_length=280)
    coach_note: str = Field(min_length=1, max_length=1200)


class CoachMessageOutput(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    risk_insight: str = Field(min_length=1, max_length=800)
    recommended_action: str = Field(min_length=1, max_length=280)
    tone: str = Field(min_length=1, max_length=40)


class WeeklyInsightsOutput(BaseModel):
    completion_patterns: list[str] = Field(default_factory=list, max_length=8)
    risk_changes: list[str] = Field(default_factory=list, max_length=8)
    confidence_trend: str = Field(min_length=1, max_length=800)
    best_performing_days: list[str] = Field(default_factory=list, max_length=7)
    repeated_blockers: list[str] = Field(default_factory=list, max_length=8)
    next_week_focus: str = Field(min_length=1, max_length=1200)
