from app.schemas.ai_outputs import RecoveryPlanOutput
from app.schemas.common import RiskLevel
from app.services.gemini_service import GeminiService
from app.services.mission_context import MissionContext
from app.services.prompt_loader import PromptLoader


class RecoveryPlanner:
    def __init__(
        self,
        gemini_service: GeminiService | None = None,
        prompt_loader: PromptLoader | None = None,
    ) -> None:
        self.gemini_service = gemini_service
        self.prompt_loader = prompt_loader or PromptLoader()

    def generate_recovery_plan(self, context: MissionContext) -> RecoveryPlanOutput:
        try:
            snapshot = context.to_ai_snapshot()
            snapshot["recovery_trigger"] = "user_behind_schedule"
            prompt = self.prompt_loader.render("recovery_planner", {"recovery_input": snapshot})
            service = self.gemini_service or GeminiService()
            return service.generate_structured(prompt, RecoveryPlanOutput)
        except Exception:
            return self._fallback(context)

    def _fallback(self, context: MissionContext) -> RecoveryPlanOutput:
        from app.schemas.ai_outputs import RecoveryDailyPlanOutput
        from app.modules.scheduler.scheduler import Scheduler

        scheduler = Scheduler()
        daily = scheduler.generate_daily_plan(context)
        overdue = context.overdue_tasks()
        compressed = [task.title for task in overdue[:3]]

        new_confidence = max(20, context.mission.confidence_score - 10)
        risk = RiskLevel.HIGH if overdue else RiskLevel.MEDIUM

        return RecoveryPlanOutput(
            what_changed="Compressed schedule to focus on overdue and critical path work.",
            at_risk_items=[m.title for m in context.milestones if m.due_date and m.due_date < context.today][:5],
            compressed_items=compressed,
            removed_items=[],
            new_daily_plan=RecoveryDailyPlanOutput(
                focus=daily.focus,
                summary=daily.summary,
                task_titles=daily.task_titles,
                estimated_minutes=daily.estimated_minutes,
            ),
            new_confidence_score=new_confidence,
            new_risk_level=risk,
            next_best_action=daily.task_titles[0] if daily.task_titles else "Review recovery plan",
            recovery_message="You fell behind, but recovery is possible. Focus on today's compressed plan.",
        )
