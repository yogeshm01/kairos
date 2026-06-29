from app.schemas.ai_outputs import PriorityEngineOutput, TaskPriorityUpdate
from app.schemas.common import TaskPriority, TaskStatus
from app.services.gemini_service import GeminiService
from app.services.mission_context import MissionContext
from app.services.prompt_loader import PromptLoader


class PriorityEngine:
    def __init__(
        self,
        gemini_service: GeminiService | None = None,
        prompt_loader: PromptLoader | None = None,
    ) -> None:
        self.gemini_service = gemini_service
        self.prompt_loader = prompt_loader or PromptLoader()

    def reprioritize(self, context: MissionContext) -> PriorityEngineOutput:
        try:
            prompt = self.prompt_loader.render(
                "priority_engine", {"priority_input": context.to_ai_snapshot()}
            )
            service = self.gemini_service or GeminiService()
            return service.generate_structured(prompt, PriorityEngineOutput)
        except Exception:
            return self._fallback(context)

    def _fallback(self, context: MissionContext) -> PriorityEngineOutput:
        updates = []
        for task in context.tasks:
            if task.status in (TaskStatus.COMPLETED, TaskStatus.SKIPPED):
                continue
            priority = TaskPriority.MEDIUM
            reason = "Default priority"
            if task in context.overdue_tasks():
                priority = TaskPriority.CRITICAL
                reason = "Overdue task"
            elif task.scheduled_date == context.today:
                priority = TaskPriority.HIGH
                reason = "Scheduled for today"

            updates.append(
                TaskPriorityUpdate(
                    task_title=task.title,
                    priority=priority,
                    reason=reason,
                )
            )

        next_action = context.mission.next_best_action or "Complete today's highest priority task."
        if context.overdue_tasks():
            next_action = f"Clear overdue work: {context.overdue_tasks()[0].title}"

        return PriorityEngineOutput(
            priority_summary="Rule-based reprioritization applied.",
            task_priorities=updates,
            next_best_action=next_action,
        )
