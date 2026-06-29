from app.schemas.ai_outputs import ReflectionAnalysisOutput
from app.schemas.common import RiskLevel
from app.schemas.reflection import ReflectionCreate
from app.services.gemini_service import GeminiService
from app.services.mission_context import MissionContext
from app.services.prompt_loader import PromptLoader


class ReflectionEngine:
    def __init__(
        self,
        gemini_service: GeminiService | None = None,
        prompt_loader: PromptLoader | None = None,
    ) -> None:
        self.gemini_service = gemini_service
        self.prompt_loader = prompt_loader or PromptLoader()

    def analyze_reflection(
        self,
        context: MissionContext,
        reflection: ReflectionCreate,
    ) -> ReflectionAnalysisOutput:
        try:
            payload = {
                **context.to_ai_snapshot(),
                "new_reflection": reflection.model_dump(mode="json"),
            }
            prompt = self.prompt_loader.render("reflection_engine", {"reflection_input": payload})
            service = self.gemini_service or GeminiService()
            return service.generate_structured(prompt, ReflectionAnalysisOutput)
        except Exception:
            return self._fallback(context, reflection)

    def _fallback(
        self,
        context: MissionContext,
        reflection: ReflectionCreate,
    ) -> ReflectionAnalysisOutput:
        adjustment = 0
        if reflection.confidence >= 70:
            adjustment = 5
        elif reflection.confidence <= 40:
            adjustment = -5

        risk = RiskLevel.MEDIUM
        if reflection.blockers and len(reflection.blockers) > 100:
            risk = RiskLevel.HIGH

        return ReflectionAnalysisOutput(
            ai_insight=(
                f"Energy level {reflection.energy}/5 with confidence {reflection.confidence}/100. "
                "Keep momentum on high-leverage tasks."
            ),
            blocker_patterns=[reflection.blockers[:200]] if reflection.blockers else [],
            confidence_adjustment=adjustment,
            risk_adjustment=risk,
            recommended_action=context.mission.next_best_action or "Complete today's top task.",
            coach_note="Reflection logged. Adjust tomorrow based on what blocked you today.",
        )
