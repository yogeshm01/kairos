from datetime import date

from app.schemas.ai_outputs import MissionAnalysisOutput
from app.schemas.mission import MissionCreate
from app.services.gemini_service import GeminiService
from app.services.prompt_loader import PromptLoader


class MissionAiService:
    def __init__(
        self,
        gemini_service: GeminiService | None = None,
        prompt_loader: PromptLoader | None = None,
    ) -> None:
        self.gemini_service = gemini_service
        self.prompt_loader = prompt_loader or PromptLoader()

    def analyze_mission(self, mission: MissionCreate, today: date | None = None) -> MissionAnalysisOutput:
        prompt = self._build_prompt(mission, today=today or date.today())
        service = self.gemini_service or GeminiService()
        return service.generate_structured(prompt, MissionAnalysisOutput)

    def _build_prompt(self, mission: MissionCreate, today: date) -> str:
        mission_input = {
            "today": today.isoformat(),
            "title": mission.title,
            "description": mission.description,
            "deadline": mission.deadline.isoformat(),
            "why_it_matters": mission.why_it_matters,
            "available_minutes_per_day": mission.available_minutes_per_day,
            "intensity_preference": mission.intensity_preference.value,
        }
        return self.prompt_loader.render("mission_analysis", {"mission_input": mission_input})

