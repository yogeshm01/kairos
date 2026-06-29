from pydantic import BaseModel, Field


class CoachMessageResponse(BaseModel):
    mission_id: str
    message: str
    risk_insight: str
    recommended_action: str
    tone: str
