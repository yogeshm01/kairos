from pydantic import BaseModel, Field

from app.schemas.common import RiskLevel


class ConfidenceResponse(BaseModel):
    mission_id: str
    score: int = Field(ge=0, le=100)
    trend: str
    reasons: list[str] = Field(default_factory=list)
    recommended_action: str
    risk_level: RiskLevel
