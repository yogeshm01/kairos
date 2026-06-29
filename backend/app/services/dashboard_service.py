from datetime import date

from app.core.errors import not_found
from app.modules.risk.risk_analyzer import RiskAnalyzer
from app.modules.scheduler.scheduler import Scheduler
from app.repositories.daily_plan_repository import DailyPlanRepository
from app.repositories.milestone_repository import MilestoneRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.common import MilestoneStatus, TaskStatus
from app.schemas.daily_plan import DailyPlan
from app.schemas.dashboard import DashboardTask, MissionProgress, MissionToday
from app.services.confidence_service import ConfidenceService
from app.services.mission_context_loader import MissionContextLoader


class DailyPlanService:
    def __init__(
        self,
        context_loader: MissionContextLoader | None = None,
        daily_plan_repository: DailyPlanRepository | None = None,
        task_repository: TaskRepository | None = None,
        scheduler: Scheduler | None = None,
    ) -> None:
        self.context_loader = context_loader or MissionContextLoader()
        self.daily_plan_repository = daily_plan_repository or DailyPlanRepository()
        self.task_repository = task_repository or TaskRepository()
        self.scheduler = scheduler or Scheduler()

    def get_or_create_daily_plan(
        self,
        mission_id: str,
        user_id: str,
        plan_date: date | None = None,
    ) -> DailyPlan:
        target_date = plan_date or date.today()
        existing = self.daily_plan_repository.get_for_date(mission_id, user_id, target_date)
        if existing:
            return existing

        context = self.context_loader.load(mission_id, user_id, today=target_date)
        ai_output = self.scheduler.generate_daily_plan(context)
        plan_create = self.scheduler.build_daily_plan_create(context, ai_output)
        return self.daily_plan_repository.create_daily_plan(plan_create, user_id)

    def get_today_view(self, mission_id: str, user_id: str) -> MissionToday:
        context = self.context_loader.load(mission_id, user_id)
        daily_plan = self.get_or_create_daily_plan(mission_id, user_id, context.today)
        task_map = {task.id: task for task in context.tasks}
        tasks = [
            DashboardTask(task=task_map[task_id], why_it_matters=task_map[task_id].rationale)
            for task_id in daily_plan.task_ids
            if task_id in task_map
        ]

        return MissionToday(
            mission=context.mission,
            plan_date=context.today,
            daily_plan=daily_plan,
            tasks=tasks,
            next_best_action=context.mission.next_best_action or "Start today's first task.",
            estimated_minutes=daily_plan.estimated_minutes,
        )

    def update_task_status(self, task_id: str, user_id: str, status: TaskStatus):
        task = self.task_repository.mark_status(task_id, user_id, status)
        if task is None:
            raise not_found("Task not found")
        return task


class DashboardService:
    def __init__(
        self,
        context_loader: MissionContextLoader | None = None,
        daily_plan_service: DailyPlanService | None = None,
        confidence_service: ConfidenceService | None = None,
        risk_analyzer: RiskAnalyzer | None = None,
    ) -> None:
        self.context_loader = context_loader or MissionContextLoader()
        self.daily_plan_service = daily_plan_service or DailyPlanService()
        self.confidence_service = confidence_service or ConfidenceService()
        self.risk_analyzer = risk_analyzer or RiskAnalyzer()

    def get_dashboard(self, mission_id: str, user_id: str):
        from app.schemas.dashboard import MissionDashboard

        context = self.context_loader.load(mission_id, user_id)
        confidence = self.confidence_service.compute_confidence(mission_id, user_id)
        risk = self.risk_analyzer.analyze(context)
        today_view = self.daily_plan_service.get_today_view(mission_id, user_id)

        completed_tasks = sum(1 for t in context.tasks if t.status == TaskStatus.COMPLETED)
        completed_milestones = sum(
            1 for m in context.milestones if m.status == MilestoneStatus.COMPLETED
        )
        upcoming = [
            m
            for m in context.milestones
            if m.status != MilestoneStatus.COMPLETED
            and (m.due_date is None or m.due_date >= context.today)
        ][:5]

        return MissionDashboard(
            mission=context.mission,
            progress=MissionProgress(
                completion_rate=context.completion_rate(),
                completed_tasks=completed_tasks,
                total_tasks=len(context.tasks),
                completed_milestones=completed_milestones,
                total_milestones=len(context.milestones),
                days_remaining=max((context.mission.deadline - context.today).days, 0),
            ),
            confidence_score=confidence.score,
            confidence_trend=confidence.trend,
            risk_level=risk.risk_level,
            deadline_risk_score=risk.deadline_risk_score,
            next_best_action=confidence.recommended_action,
            ai_suggestions=risk.mitigations,
            todays_plan=today_view.daily_plan,
            todays_tasks=today_view.tasks,
            upcoming_milestones=upcoming,
            recent_reflections=context.recent_reflections(3),
        )

    def get_risk(self, mission_id: str, user_id: str):
        from app.schemas.dashboard import MissionRiskResponse

        context = self.context_loader.load(mission_id, user_id)
        risk = self.risk_analyzer.analyze(context)
        return MissionRiskResponse(
            mission_id=mission_id,
            risk_level=risk.risk_level,
            deadline_risk_score=risk.deadline_risk_score,
            risk_factors=risk.risk_factors,
            mitigations=risk.mitigations,
            summary=risk.summary,
        )
