from pydantic import BaseModel

from app.schemas.ai_outputs import MissionAnalysisOutput
from app.schemas.daily_plan import DailyPlan
from app.schemas.milestone import Milestone
from app.schemas.mission import Mission
from app.schemas.task import Task


class MissionPlanResponse(BaseModel):
    mission: Mission
    milestones: list[Milestone]
    tasks: list[Task]
    analysis: MissionAnalysisOutput
    daily_plan: DailyPlan | None = None

