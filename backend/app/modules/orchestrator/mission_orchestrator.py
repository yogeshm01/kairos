from datetime import date, timedelta

from app.modules.scheduler.scheduler import Scheduler
from app.repositories.ai_event_repository import AiEventRepository
from app.repositories.daily_plan_repository import DailyPlanRepository
from app.repositories.milestone_repository import MilestoneRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.ai_event import AiEventCreate
from app.schemas.ai_outputs import AiMilestoneOutput, AiTaskOutput
from app.schemas.common import AiEventType
from app.schemas.milestone import Milestone, MilestoneCreate
from app.schemas.mission import MissionCreate, MissionUpdate
from app.schemas.mission_plan import MissionPlanResponse
from app.schemas.task import Task, TaskCreate
from app.services.mission_ai_service import MissionAiService
from app.services.mission_context import MissionContext


class MissionOrchestrator:
    def __init__(
        self,
        mission_repository: MissionRepository | None = None,
        milestone_repository: MilestoneRepository | None = None,
        task_repository: TaskRepository | None = None,
        ai_event_repository: AiEventRepository | None = None,
        mission_ai_service: MissionAiService | None = None,
        daily_plan_repository: DailyPlanRepository | None = None,
        scheduler: Scheduler | None = None,
    ) -> None:
        self.mission_repository = mission_repository or MissionRepository()
        self.milestone_repository = milestone_repository or MilestoneRepository()
        self.task_repository = task_repository or TaskRepository()
        self.ai_event_repository = ai_event_repository or AiEventRepository()
        self.mission_ai_service = mission_ai_service or MissionAiService()
        self.daily_plan_repository = daily_plan_repository or DailyPlanRepository()
        self.scheduler = scheduler or Scheduler()

    def create_mission_plan(
        self,
        mission_input: MissionCreate,
        user_id: str,
        today: date | None = None,
    ) -> MissionPlanResponse:
        start_date = today or date.today()
        analysis = self.mission_ai_service.analyze_mission(mission_input, today=start_date)

        mission = self.mission_repository.create_mission(mission_input, user_id)
        mission = self.mission_repository.update_mission(
            mission.id,
            user_id,
            MissionUpdate(
                confidence_score=analysis.confidence_score,
                risk_level=analysis.risk_level,
                next_best_action=analysis.next_best_action,
            ),
        )
        if mission is None:
            raise RuntimeError("Mission disappeared during orchestration.")

        milestones = self._create_milestones(mission.id, user_id, analysis.milestones, start_date)
        tasks = self._create_tasks(mission.id, user_id, analysis.tasks, milestones, start_date)
        daily_plan = self._create_initial_daily_plan(
            mission, milestones, tasks, user_id, start_date, analysis.next_best_action
        )

        self.ai_event_repository.create_event(
            AiEventCreate(
                mission_id=mission.id,
                event_type=AiEventType.MISSION_ANALYSIS,
                module_name="mission_orchestrator",
                input_snapshot=mission_input.model_dump(mode="json"),
                output_snapshot=analysis.model_dump(mode="json"),
            ),
            user_id,
        )

        return MissionPlanResponse(
            mission=mission,
            milestones=milestones,
            tasks=tasks,
            analysis=analysis,
            daily_plan=daily_plan,
        )

    def _create_initial_daily_plan(
        self,
        mission,
        milestones,
        tasks,
        user_id: str,
        start_date: date,
        next_best_action: str,
    ):
        context = MissionContext(
            mission=mission,
            milestones=milestones,
            tasks=tasks,
            reflections=[],
            today=start_date,
        )
        ai_output = self.scheduler.generate_daily_plan(context)
        plan_create = self.scheduler.build_daily_plan_create(context, ai_output)
        if not plan_create.coach_message:
            plan_create.coach_message = next_best_action
        return self.daily_plan_repository.create_daily_plan(plan_create, user_id)

    def _create_milestones(
        self,
        mission_id: str,
        user_id: str,
        milestone_outputs: list[AiMilestoneOutput],
        start_date: date,
    ) -> list[Milestone]:
        milestones: list[Milestone] = []
        for index, item in enumerate(milestone_outputs):
            due_date = start_date + timedelta(days=item.target_day - 1)
            milestones.append(
                self.milestone_repository.create_milestone(
                    MilestoneCreate(
                        mission_id=mission_id,
                        title=item.title,
                        description=item.description,
                        due_date=due_date,
                        order_index=index,
                    ),
                    user_id,
                )
            )
        return milestones

    def _create_tasks(
        self,
        mission_id: str,
        user_id: str,
        task_outputs: list[AiTaskOutput],
        milestones: list[Milestone],
        start_date: date,
    ) -> list[Task]:
        milestone_ids_by_title = {milestone.title.lower(): milestone.id for milestone in milestones}
        tasks: list[Task] = []

        for index, item in enumerate(task_outputs):
            scheduled_date = start_date + timedelta(days=item.suggested_day - 1)
            tasks.append(
                self.task_repository.create_task(
                    TaskCreate(
                        mission_id=mission_id,
                        milestone_id=milestone_ids_by_title.get(item.milestone_title.lower()),
                        title=item.title,
                        description=item.description,
                        scheduled_date=scheduled_date,
                        estimated_minutes=item.estimated_minutes,
                        priority=item.priority,
                        rationale=item.rationale,
                        order_index=index,
                    ),
                    user_id,
                )
            )

        return tasks
