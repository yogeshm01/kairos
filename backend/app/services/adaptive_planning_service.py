from datetime import date

from app.core.errors import not_found
from app.modules.scheduler.scheduler import Scheduler
from app.repositories.daily_plan_repository import DailyPlanRepository
from app.repositories.milestone_repository import MilestoneRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.common import TaskStatus
from app.schemas.daily_plan import DailyPlan
from app.services.mission_context_loader import MissionContextLoader


class AdaptivePlanningService:
    def __init__(
        self,
        context_loader: MissionContextLoader | None = None,
        daily_plan_repository: DailyPlanRepository | None = None,
        task_repository: TaskRepository | None = None,
        milestone_repository: MilestoneRepository | None = None,
        scheduler: Scheduler | None = None,
    ) -> None:
        self.context_loader = context_loader or MissionContextLoader()
        self.daily_plan_repository = daily_plan_repository or DailyPlanRepository()
        self.task_repository = task_repository or TaskRepository()
        self.milestone_repository = milestone_repository or MilestoneRepository()
        self.scheduler = scheduler or Scheduler()

    def adapt_plan_after_task_change(
        self,
        mission_id: str,
        user_id: str,
        task_id: str,
        new_status: TaskStatus,
    ) -> dict:
        """
        Adapt the mission plan after a task status change.
        This analyzes the impact and suggests adjustments to the remaining plan.
        """
        context = self.context_loader.load(mission_id, user_id)
        task = self.task_repository.get_task(task_id, user_id)
        
        if not task:
            raise not_found("Task not found")

        # Only adapt for significant status changes
        if new_status not in [TaskStatus.COMPLETED, TaskStatus.SKIPPED]:
            return {"adapted": False, "reason": "No adaptation needed for this status change"}

        # Calculate impact on timeline
        completed_tasks = [t for t in context.tasks if t.status == TaskStatus.COMPLETED]
        skipped_tasks = [t for t in context.tasks if t.status == TaskStatus.SKIPPED]
        remaining_tasks = [t for t in context.tasks if t.status in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]]
        
        # If task was skipped, we may need to redistribute its work
        if new_status == TaskStatus.SKIPPED and task.estimated_minutes:
            adaptation_needed = self._assess_skip_impact(task, remaining_tasks, context)
            if adaptation_needed["needs_adaptation"]:
                return self._generate_skip_adaptation(task, adaptation_needed, context, user_id)

        # If task was completed ahead/behind schedule, adjust future tasks
        if new_status == TaskStatus.COMPLETED:
            adaptation_needed = self._assess_completion_impact(task, context)
            if adaptation_needed["needs_adaptation"]:
                return self._generate_completion_adaptation(task, adaptation_needed, context, user_id)

        return {"adapted": False, "reason": "Plan is on track, no adaptation needed"}

    def _assess_skip_impact(self, task, remaining_tasks, context) -> dict:
        """Assess whether skipping a task requires plan adaptation."""
        # If the task was critical (high priority) or had significant time allocation
        if task.priority in ["high", "critical"] or (task.estimated_minutes and task.estimated_minutes > 60):
            return {
                "needs_adaptation": True,
                "impact": "significant",
                "estimated_minutes_lost": task.estimated_minutes or 0,
            }
        
        # If we're already behind schedule
        days_remaining = (context.mission.deadline - context.today).days
        if days_remaining < 7:
            return {
                "needs_adaptation": True,
                "impact": "moderate",
                "reason": "Limited time remaining",
            }
        
        return {"needs_adaptation": False}

    def _assess_completion_impact(self, task, context) -> dict:
        """Assess whether task completion requires plan adaptation."""
        # Check if completion was ahead/behind schedule
        if task.scheduled_date and task.scheduled_date > context.today:
            return {
                "needs_adaptation": True,
                "impact": "positive",
                "reason": "Task completed ahead of schedule",
            }
        
        # Check if we're falling behind
        completed_count = sum(1 for t in context.tasks if t.status == TaskStatus.COMPLETED)
        total_count = len(context.tasks)
        progress_ratio = completed_count / total_count if total_count > 0 else 0
        
        days_elapsed = (context.today - context.mission.created_at.date()).days
        total_days = (context.mission.deadline - context.mission.created_at.date()).days
        time_ratio = days_elapsed / total_days if total_days > 0 else 0
        
        if progress_ratio < time_ratio * 0.8:  # Behind by more than 20%
            return {
                "needs_adaptation": True,
                "impact": "negative",
                "reason": "Progress behind schedule",
            }
        
        return {"needs_adaptation": False}

    def _generate_skip_adaptation(self, task, assessment, context, user_id: str) -> dict:
        """Generate adaptation plan for skipped task."""
        # Regenerate daily plan to redistribute work
        ai_output = self.scheduler.generate_daily_plan(context)
        plan_create = self.scheduler.build_daily_plan_create(context, ai_output)
        
        # Update today's daily plan
        today_plan = self.daily_plan_repository.get_for_date(
            context.mission.id, user_id, context.today
        )
        
        if today_plan:
            # Update existing plan
            updated_plan = self.daily_plan_repository.update_daily_plan(
                today_plan.id, user_id, plan_create
            )
        else:
            # Create new plan
            updated_plan = self.daily_plan_repository.create_daily_plan(plan_create, user_id)
        
        return {
            "adapted": True,
            "adaptation_type": "skip",
            "task_skipped": task.title,
            "impact": assessment["impact"],
            "new_daily_plan": updated_plan,
            "message": f"Plan adapted: redistributed work from skipped task '{task.title}'",
        }

    def _generate_completion_adaptation(self, task, assessment, context, user_id: str) -> dict:
        """Generate adaptation plan for completed task."""
        if assessment["impact"] == "positive":
            # Ahead of schedule - can potentially relax or accelerate
            return {
                "adapted": True,
                "adaptation_type": "acceleration",
                "task_completed": task.title,
                "message": f"Great progress! Task '{task.title}' completed ahead of schedule. Consider accelerating next milestones.",
            }
        else:
            # Behind schedule - may need recovery plan
            from app.services.recovery_service import RecoveryService
            
            recovery_service = RecoveryService()
            recovery_plan = recovery_service.generate_recovery_plan(context.mission.id, user_id)
            
            return {
                "adapted": True,
                "adaptation_type": "recovery",
                "task_completed": task.title,
                "recovery_plan": recovery_plan,
                "message": f"Task '{task.title}' completed but overall progress is behind. Recovery plan generated.",
            }
