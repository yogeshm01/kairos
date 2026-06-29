from app.schemas.ai_outputs import CoachMessageOutput
from app.schemas.common import RiskLevel
from app.services.gemini_service import GeminiService
from app.services.mission_context import MissionContext
from app.services.prompt_loader import PromptLoader


class Coach:
    def __init__(
        self,
        gemini_service: GeminiService | None = None,
        prompt_loader: PromptLoader | None = None,
    ) -> None:
        self.gemini_service = gemini_service
        self.prompt_loader = prompt_loader or PromptLoader()

    def generate_message(self, context: MissionContext) -> CoachMessageOutput:
        try:
            prompt = self.prompt_loader.render("coach", {"coach_input": context.to_ai_snapshot()})
            service = self.gemini_service or GeminiService()
            return service.generate_structured(prompt, CoachMessageOutput)
        except Exception:
            return self._fallback(context)

    def _fallback(self, context: MissionContext) -> CoachMessageOutput:
        overdue = len(context.overdue_tasks())
        tone = "urgent" if overdue > 2 else "encouraging"
        action = context.mission.next_best_action or "Start your highest priority task."

        if overdue:
            risk_insight = f"You have {overdue} overdue tasks threatening the deadline."
            message = f"Mission '{context.mission.title}' needs recovery focus today."
        else:
            risk_insight = f"Risk level is {context.mission.risk_level.value}."
            message = f"Stay on track with '{context.mission.title}'. Consistency wins."

        return CoachMessageOutput(
            message=message,
            risk_insight=risk_insight,
            recommended_action=action,
            tone=tone,
        )
