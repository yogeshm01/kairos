from pydantic import BaseModel, Field

from app.schemas.ai_outputs import RecoveryPlanOutput
from app.schemas.common import RiskLevel
from app.schemas.daily_plan import DailyPlan
from app.schemas.mission import Mission


class RecoveryPlanResponse(BaseModel):
    mission_id: str
    plan: RecoveryPlanOutput
    generated_at: str


class ApplyRecoveryPlanResponse(BaseModel):
    mission: Mission
    daily_plan: DailyPlan
    applied_changes: list[str] = Field(default_factory=list)
    new_confidence_score: int = Field(ge=0, le=100)
    new_risk_level: RiskLevel
    next_best_action: str
