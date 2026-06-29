from datetime import date

from app.modules.risk.risk_analyzer import RiskAnalyzer
from app.schemas.common import MilestoneStatus, RiskLevel, TaskStatus
from app.schemas.confidence import ConfidenceResponse
from app.schemas.mission import MissionUpdate
from app.repositories.mission_repository import MissionRepository
from app.services.mission_context_loader import MissionContextLoader


class ConfidenceService:
    def __init__(
        self,
        context_loader: MissionContextLoader | None = None,
        mission_repository: MissionRepository | None = None,
        risk_analyzer: RiskAnalyzer | None = None,
    ) -> None:
        self.context_loader = context_loader or MissionContextLoader()
        self.mission_repository = mission_repository or MissionRepository()
        self.risk_analyzer = risk_analyzer or RiskAnalyzer()

    def compute_confidence(
        self,
        mission_id: str,
        user_id: str,
        today: date | None = None,
    ) -> ConfidenceResponse:
        context = self.context_loader.load(mission_id, user_id, today=today)
        risk = self.risk_analyzer.analyze(context)

        score = context.mission.confidence_score
        reasons: list[str] = []

        completion = context.completion_rate()
        score = self._adjust(score, int(completion * 20), "Task completion progress")
        reasons.append(f"Task completion rate is {int(completion * 100)}%.")

        days_left = max((context.mission.deadline - context.today).days, 0)
        if days_left <= 7:
            score -= 10
            reasons.append("Deadline is within one week.")
        elif days_left >= 30:
            score += 5
            reasons.append("Healthy buffer before deadline.")

        overdue = len(context.overdue_tasks())
        if overdue:
            score -= min(overdue * 5, 20)
            reasons.append(f"{overdue} overdue tasks reduce confidence.")

        completed_milestones = sum(
            1 for m in context.milestones if m.status == MilestoneStatus.COMPLETED
        )
        if context.milestones:
            milestone_rate = completed_milestones / len(context.milestones)
            score = self._adjust(score, int(milestone_rate * 10), "Milestone progress")
            reasons.append(f"Milestone completion is {int(milestone_rate * 100)}%.")

        if context.reflections:
            recent = context.recent_reflections(1)[0]
            if recent.confidence >= 70:
                score += 5
                reasons.append("Recent reflection shows high confidence.")
            elif recent.confidence <= 40:
                score -= 5
                reasons.append("Recent reflection shows low confidence.")

        score -= risk.deadline_risk_score // 10
        reasons.append(f"Deadline risk score is {risk.deadline_risk_score}/100.")

        score = max(0, min(100, score))
        trend = self._trend(score, context.mission.confidence_score)

        recommended = context.mission.next_best_action or "Complete today's highest priority task."
        if overdue:
            recommended = f"Address overdue work first: {context.overdue_tasks()[0].title}"

        self.mission_repository.update_mission(
            mission_id,
            user_id,
            MissionUpdate(confidence_score=score, risk_level=risk.risk_level),
        )

        return ConfidenceResponse(
            mission_id=mission_id,
            score=score,
            trend=trend,
            reasons=reasons,
            recommended_action=recommended,
            risk_level=risk.risk_level,
        )

    def _adjust(self, score: int, delta: int, _reason: str) -> int:
        return max(0, min(100, score + delta))

    def _trend(self, new_score: int, previous_score: int) -> str:
        diff = new_score - previous_score
        if diff > 5:
            return "improving"
        if diff < -5:
            return "declining"
        return "stable"
