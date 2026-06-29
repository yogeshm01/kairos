from datetime import date

from app.modules.risk.risk_analyzer import RiskAnalyzer
from app.modules.scheduler.scheduler import Scheduler
from app.schemas.common import RiskLevel, TaskPriority, TaskStatus
from app.schemas.mission import Mission
from app.schemas.task import Task
from app.services.mission_context import MissionContext


def test_scheduler_fallback_selects_tasks() -> None:
    context = MissionContext(
        mission=Mission(
            id="m1",
            user_id="u1",
            title="Mission",
            deadline=date(2026, 8, 1),
            available_minutes_per_day=120,
        ),
        milestones=[],
        tasks=[
            Task(
                id="t1",
                user_id="u1",
                mission_id="m1",
                title="Today task",
                scheduled_date=date(2026, 6, 26),
                estimated_minutes=60,
                priority=TaskPriority.HIGH,
            ),
            Task(
                id="t2",
                user_id="u1",
                mission_id="m1",
                title="Overdue task",
                scheduled_date=date(2026, 6, 20),
                estimated_minutes=30,
                priority=TaskPriority.CRITICAL,
                status=TaskStatus.PENDING,
            ),
        ],
        reflections=[],
        today=date(2026, 6, 26),
    )

    output = Scheduler(gemini_service=_ExplodingGemini()).generate_daily_plan(context)
    plan = Scheduler().build_daily_plan_create(context, output)

    assert plan.focus
    assert plan.estimated_minutes >= 0
    assert plan.task_ids


def test_risk_analyzer_fallback_detects_overdue() -> None:
    context = MissionContext(
        mission=Mission(
            id="m1",
            user_id="u1",
            title="Mission",
            deadline=date(2026, 7, 1),
        ),
        milestones=[],
        tasks=[
            Task(
                id="t1",
                user_id="u1",
                mission_id="m1",
                title="Overdue",
                scheduled_date=date(2026, 6, 20),
                status=TaskStatus.PENDING,
            )
        ],
        reflections=[],
        today=date(2026, 6, 26),
    )

    risk = RiskAnalyzer(gemini_service=_ExplodingGemini()).analyze(context)

    assert risk.deadline_risk_score > 0
    assert risk.risk_level in {RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL}


class _ExplodingGemini:
    def generate_structured(self, *_args, **_kwargs):
        raise RuntimeError("Gemini unavailable")
