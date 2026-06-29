from datetime import date, timedelta

from app.schemas.ai_outputs import WeeklyInsightsOutput
from app.schemas.common import TaskStatus
from app.schemas.weekly_insights import WeeklyInsightsResponse
from app.services.gemini_service import GeminiService
from app.services.mission_context_loader import MissionContextLoader
from app.services.prompt_loader import PromptLoader


class WeeklyInsightsService:
    def __init__(
        self,
        context_loader: MissionContextLoader | None = None,
        gemini_service: GeminiService | None = None,
        prompt_loader: PromptLoader | None = None,
    ) -> None:
        self.context_loader = context_loader or MissionContextLoader()
        self.gemini_service = gemini_service
        self.prompt_loader = prompt_loader or PromptLoader()

    def get_weekly_insights(
        self,
        mission_id: str,
        user_id: str,
        today: date | None = None,
    ) -> WeeklyInsightsResponse:
        current = today or date.today()
        week_start = current - timedelta(days=current.weekday())
        week_end = week_start + timedelta(days=6)

        context = self.context_loader.load(mission_id, user_id, today=current)
        try:
            prompt = self.prompt_loader.render(
                "weekly_insights",
                {
                    "insights_input": {
                        **context.to_ai_snapshot(),
                        "weekly_window": {
                            "start": week_start.isoformat(),
                            "end": week_end.isoformat(),
                        },
                    }
                },
            )
            service = self.gemini_service or GeminiService()
            insights = service.generate_structured(prompt, WeeklyInsightsOutput)
        except Exception:
            insights = self._fallback(context, week_start, week_end)

        confidence_scores = [context.mission.confidence_score]
        completion_rates = [context.completion_rate()]

        return WeeklyInsightsResponse(
            mission_id=mission_id,
            week_start=week_start.isoformat(),
            week_end=week_end.isoformat(),
            insights=insights,
            confidence_scores=confidence_scores,
            task_completion_rates=completion_rates,
        )

    def _fallback(self, context, week_start: date, week_end: date) -> WeeklyInsightsOutput:
        completed_by_day: dict[str, int] = {}
        for task in context.tasks:
            if task.status == TaskStatus.COMPLETED and task.scheduled_date:
                day = task.scheduled_date.isoformat()
                completed_by_day[day] = completed_by_day.get(day, 0) + 1

        best_days = sorted(completed_by_day, key=completed_by_day.get, reverse=True)[:3]
        blockers = [r.blockers for r in context.recent_reflections(5) if r.blockers]

        return WeeklyInsightsOutput(
            completion_patterns=[
                f"Completed {sum(completed_by_day.values())} tasks this period.",
            ],
            risk_changes=[f"Current risk level: {context.mission.risk_level.value}"],
            confidence_trend=f"Confidence is {context.mission.confidence_score}/100.",
            best_performing_days=best_days,
            repeated_blockers=blockers[:3],
            next_week_focus=context.mission.next_best_action or "Maintain daily execution rhythm.",
        )
