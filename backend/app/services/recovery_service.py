from datetime import UTC, datetime

from app.core.errors import bad_gateway, not_found, service_unavailable
from app.modules.recovery.recovery_planner import RecoveryPlanner
from app.repositories.ai_event_repository import AiEventRepository
from app.repositories.daily_plan_repository import DailyPlanRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.ai_event import AiEventCreate
from app.schemas.common import AiEventType, TaskStatus
from app.schemas.daily_plan import DailyPlanCreate, DailyPlanUpdate
from app.schemas.mission import MissionUpdate
from app.schemas.recovery import ApplyRecoveryPlanResponse, RecoveryPlanResponse
from app.schemas.task import TaskUpdate
from app.services.gemini_service import GeminiConfigurationError, GeminiResponseError
from app.services.mission_context_loader import MissionContextLoader


class RecoveryService:
    _pending_plans: dict[str, RecoveryPlanResponse] = {}

    def __init__(
        self,
        context_loader: MissionContextLoader | None = None,
        recovery_planner: RecoveryPlanner | None = None,
        mission_repository: MissionRepository | None = None,
        task_repository: TaskRepository | None = None,
        daily_plan_repository: DailyPlanRepository | None = None,
        ai_event_repository: AiEventRepository | None = None,
    ) -> None:
        self.context_loader = context_loader or MissionContextLoader()
        self.recovery_planner = recovery_planner or RecoveryPlanner()
        self.mission_repository = mission_repository or MissionRepository()
        self.task_repository = task_repository or TaskRepository()
        self.daily_plan_repository = daily_plan_repository or DailyPlanRepository()
        self.ai_event_repository = ai_event_repository or AiEventRepository()

    def generate_recovery_plan(self, mission_id: str, user_id: str) -> RecoveryPlanResponse:
        context = self.context_loader.load(mission_id, user_id)
        try:
            plan = self.recovery_planner.generate_recovery_plan(context)
        except GeminiConfigurationError as exc:
            raise service_unavailable(str(exc)) from exc
        except GeminiResponseError as exc:
            raise bad_gateway(str(exc)) from exc

        response = RecoveryPlanResponse(
            mission_id=mission_id,
            plan=plan,
            generated_at=datetime.now(UTC).isoformat(),
        )
        self._pending_plans[f"{user_id}:{mission_id}"] = response

        self.ai_event_repository.create_event(
            AiEventCreate(
                mission_id=mission_id,
                event_type=AiEventType.RECOVERY_GENERATED,
                module_name="recovery_planner",
                input_snapshot=context.to_ai_snapshot(),
                output_snapshot=plan.model_dump(mode="json"),
            ),
            user_id,
        )
        return response

    def apply_recovery_plan(self, mission_id: str, user_id: str) -> ApplyRecoveryPlanResponse:
        key = f"{user_id}:{mission_id}"
        pending = self._pending_plans.get(key)
        if pending is None:
            pending = self.generate_recovery_plan(mission_id, user_id)

        context = self.context_loader.load(mission_id, user_id)
        plan = pending.plan
        task_map = {task.title.lower(): task for task in context.tasks}

        applied: list[str] = []
        for title in plan.removed_items:
            task = task_map.get(title.lower())
            if task:
                self.task_repository.mark_status(task.id, user_id, TaskStatus.SKIPPED)
                applied.append(f"Skipped: {title}")

        for title in plan.compressed_items:
            task = task_map.get(title.lower())
            if task and task.estimated_minutes:
                new_minutes = max(15, task.estimated_minutes // 2)
                self.task_repository.update_task(
                    task.id,
                    user_id,
                    TaskUpdate(estimated_minutes=new_minutes),
                )
                applied.append(f"Compressed: {title}")

        task_ids = [
            task_map[title.lower()].id
            for title in plan.new_daily_plan.task_titles
            if title.lower() in task_map
        ]

        existing_plan = self.daily_plan_repository.get_for_date(
            mission_id, user_id, context.today
        )
        if existing_plan:
            daily_plan = self.daily_plan_repository.update_daily_plan(
                existing_plan.id,
                user_id,
                DailyPlanUpdate(
                    focus=plan.new_daily_plan.focus,
                    summary=plan.new_daily_plan.summary,
                    task_ids=task_ids,
                    estimated_minutes=plan.new_daily_plan.estimated_minutes,
                    risk_level=plan.new_risk_level,
                    coach_message=plan.recovery_message,
                ),
            )
        else:
            daily_plan = self.daily_plan_repository.create_daily_plan(
                DailyPlanCreate(
                    mission_id=mission_id,
                    plan_date=context.today,
                    focus=plan.new_daily_plan.focus,
                    summary=plan.new_daily_plan.summary,
                    task_ids=task_ids,
                    estimated_minutes=plan.new_daily_plan.estimated_minutes,
                    risk_level=plan.new_risk_level,
                    coach_message=plan.recovery_message,
                ),
                user_id,
            )

        if daily_plan is None:
            raise not_found("Failed to create daily plan")

        mission = self.mission_repository.update_mission(
            mission_id,
            user_id,
            MissionUpdate(
                confidence_score=plan.new_confidence_score,
                risk_level=plan.new_risk_level,
                next_best_action=plan.next_best_action,
            ),
        )
        if mission is None:
            raise not_found("Mission not found")

        self._pending_plans.pop(key, None)
        return ApplyRecoveryPlanResponse(
            mission=mission,
            daily_plan=daily_plan,
            applied_changes=applied or [plan.what_changed],
            new_confidence_score=plan.new_confidence_score,
            new_risk_level=plan.new_risk_level,
            next_best_action=plan.next_best_action,
        )
