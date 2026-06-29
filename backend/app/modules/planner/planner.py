from app.schemas.ai_outputs import PlannerOutput
from app.schemas.mission import MissionCreate
from app.services.gemini_service import GeminiService
from app.services.mission_context import MissionContext
from app.services.prompt_loader import PromptLoader


class Planner:
    def __init__(
        self,
        gemini_service: GeminiService | None = None,
        prompt_loader: PromptLoader | None = None,
    ) -> None:
        self.gemini_service = gemini_service
        self.prompt_loader = prompt_loader or PromptLoader()

    def refine_plan(self, context: MissionContext) -> PlannerOutput:
        prompt = self.prompt_loader.render("planner", {"planner_input": context.to_ai_snapshot()})
        service = self.gemini_service or GeminiService()
        return service.generate_structured(prompt, PlannerOutput)

    def build_initial_input(self, mission: MissionCreate, today) -> dict:
        return {
            "today": today.isoformat(),
            "title": mission.title,
            "description": mission.description,
            "deadline": mission.deadline.isoformat(),
            "why_it_matters": mission.why_it_matters,
            "available_minutes_per_day": mission.available_minutes_per_day,
            "intensity_preference": mission.intensity_preference,
        }
