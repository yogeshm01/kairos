from pydantic import BaseModel, Field

from app.schemas.ai_outputs import WeeklyInsightsOutput


class WeeklyInsightsResponse(BaseModel):
    mission_id: str
    week_start: str
    week_end: str
    insights: WeeklyInsightsOutput
    confidence_scores: list[int] = Field(default_factory=list)
    task_completion_rates: list[float] = Field(default_factory=list)
