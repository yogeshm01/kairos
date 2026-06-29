from datetime import date

from app.schemas.ai_outputs import RiskAnalysisOutput
from app.schemas.common import RiskLevel
from app.services.gemini_service import GeminiService
from app.services.mission_context import MissionContext
from app.services.prompt_loader import PromptLoader


class RiskAnalyzer:
    def __init__(
        self,
        gemini_service: GeminiService | None = None,
        prompt_loader: PromptLoader | None = None,
    ) -> None:
        self.gemini_service = gemini_service
        self.prompt_loader = prompt_loader or PromptLoader()

    def analyze(self, context: MissionContext) -> RiskAnalysisOutput:
        try:
            prompt = self.prompt_loader.render("risk_analyzer", {"risk_input": context.to_ai_snapshot()})
            service = self.gemini_service or GeminiService()
            return service.generate_structured(prompt, RiskAnalysisOutput)
        except Exception:
            return self._fallback(context)

    def _fallback(self, context: MissionContext) -> RiskAnalysisOutput:
        overdue = len(context.overdue_tasks())
        days_left = (context.mission.deadline - context.today).days
        completion = context.completion_rate()

        risk_score = 20
        factors: list[str] = []

        if overdue:
            risk_score += min(overdue * 8, 40)
            factors.append(f"{overdue} overdue tasks")

        if days_left <= 7:
            risk_score += 25
            factors.append("Deadline within one week")
        elif days_left <= 14:
            risk_score += 10
            factors.append("Deadline within two weeks")

        if completion < 0.3 and days_left < 21:
            risk_score += 15
            factors.append("Low completion rate relative to deadline")

        risk_score = min(risk_score, 100)
        risk_level = self._score_to_level(risk_score)

        return RiskAnalysisOutput(
            risk_level=risk_level,
            deadline_risk_score=risk_score,
            risk_factors=factors or ["No major risk signals detected"],
            mitigations=self._mitigations(risk_level, context),
            summary=f"Deadline risk score is {risk_score}/100 with {days_left} days remaining.",
        )

    def _score_to_level(self, score: int) -> RiskLevel:
        if score >= 75:
            return RiskLevel.CRITICAL
        if score >= 50:
            return RiskLevel.HIGH
        if score >= 25:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW

    def _mitigations(self, risk_level: RiskLevel, context: MissionContext) -> list[str]:
        if risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL):
            return [
                "Trigger recovery planning",
                "Focus only on critical path tasks",
                "Reduce scope on non-essential milestones",
            ]
        if context.overdue_tasks():
            return ["Clear overdue tasks before taking new work"]
        return ["Maintain current pace and complete today's plan"]
