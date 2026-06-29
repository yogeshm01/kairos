from datetime import date

from app.modules.orchestrator.mission_orchestrator import MissionOrchestrator
from app.schemas.ai_outputs import AiMilestoneOutput, AiTaskOutput, MissionAnalysisOutput
from app.schemas.common import RiskLevel, TaskPriority
from app.schemas.milestone import Milestone, MilestoneCreate
from app.schemas.mission import Mission, MissionCreate, MissionUpdate
from app.schemas.task import Task, TaskCreate


class FakeMissionAiService:
    def analyze_mission(self, mission: MissionCreate, today: date) -> MissionAnalysisOutput:
        return MissionAnalysisOutput(
            mission_summary=f"Plan for {mission.title}",
            success_strategy="Do the highest leverage work first.",
            key_risks=["Inconsistent practice"],
            assumptions=["User can study daily"],
            confidence_score=72,
            risk_level=RiskLevel.MEDIUM,
            next_best_action="Start the first focused practice block.",
            milestones=[
                AiMilestoneOutput(
                    title="DSA Foundation",
                    description="Cover core patterns.",
                    target_day=3,
                    success_criteria=["Finish arrays and strings"],
                )
            ],
            tasks=[
                AiTaskOutput(
                    title="Practice arrays",
                    description="Solve five array problems.",
                    milestone_title="DSA Foundation",
                    suggested_day=1,
                    estimated_minutes=90,
                    priority=TaskPriority.HIGH,
                    rationale="Arrays are a common interview base.",
                )
            ],
        )


class FakeMissionRepository:
    def create_mission(self, data: MissionCreate, user_id: str) -> Mission:
        return Mission(id="mission-1", user_id=user_id, **data.model_dump())

    def update_mission(
        self, mission_id: str, user_id: str, data: MissionUpdate
    ) -> Mission | None:
        return Mission(
            id=mission_id,
            user_id=user_id,
            title="Crack Google Internship",
            description="Prepare well.",
            deadline=date(2026, 7, 30),
            confidence_score=data.confidence_score or 50,
            risk_level=data.risk_level or RiskLevel.MEDIUM,
            next_best_action=data.next_best_action,
        )


class FakeMilestoneRepository:
    def create_milestone(self, data: MilestoneCreate, user_id: str) -> Milestone:
        return Milestone(id="milestone-1", user_id=user_id, **data.model_dump())


class FakeTaskRepository:
    def create_task(self, data: TaskCreate, user_id: str) -> Task:
        return Task(id="task-1", user_id=user_id, **data.model_dump())


class FakeDailyPlanRepository:
    def create_daily_plan(self, data, user_id: str):
        from app.schemas.daily_plan import DailyPlan

        return DailyPlan(id="plan-1", user_id=user_id, **data.model_dump())


class FakeScheduler:
    def generate_daily_plan(self, context):
        from app.schemas.ai_outputs import DailyPlanAiOutput
        from app.schemas.common import RiskLevel

        return DailyPlanAiOutput(
            focus="Start strong",
            summary="Complete first practice block.",
            task_titles=["Practice arrays"],
            estimated_minutes=90,
            risk_level=RiskLevel.MEDIUM,
        )

    def build_daily_plan_create(self, context, ai_output):
        from app.schemas.daily_plan import DailyPlanCreate

        return DailyPlanCreate(
            mission_id=context.mission.id,
            plan_date=context.today,
            focus=ai_output.focus,
            summary=ai_output.summary,
            task_ids=["task-1"],
            estimated_minutes=ai_output.estimated_minutes,
            risk_level=ai_output.risk_level,
        )


class FakeAiEventRepository:
    def __init__(self) -> None:
        self.created = []

    def create_event(self, data, user_id: str):
        self.created.append((data, user_id))
        return data


def test_mission_orchestrator_creates_plan() -> None:
    event_repository = FakeAiEventRepository()
    orchestrator = MissionOrchestrator(
        mission_repository=FakeMissionRepository(),
        milestone_repository=FakeMilestoneRepository(),
        task_repository=FakeTaskRepository(),
        ai_event_repository=event_repository,
        mission_ai_service=FakeMissionAiService(),
        daily_plan_repository=FakeDailyPlanRepository(),
        scheduler=FakeScheduler(),
    )
    mission = MissionCreate(
        title="Crack Google Internship",
        description="Prepare well.",
        deadline=date(2026, 7, 30),
        available_minutes_per_day=120,
    )

    plan = orchestrator.create_mission_plan(mission, user_id="user-1", today=date(2026, 6, 26))

    assert plan.mission.confidence_score == 72
    assert plan.mission.next_best_action == "Start the first focused practice block."
    assert plan.milestones[0].due_date == date(2026, 6, 28)
    assert plan.tasks[0].scheduled_date == date(2026, 6, 26)
    assert plan.tasks[0].milestone_id == "milestone-1"
    assert plan.daily_plan is not None
    assert len(event_repository.created) == 1
