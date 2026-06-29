from datetime import date

import pytest

from app.modules.risk.risk_analyzer import RiskAnalyzer
from app.schemas.common import MilestoneStatus, RiskLevel, TaskPriority, TaskStatus
from app.schemas.milestone import Milestone
from app.schemas.mission import Mission
from app.schemas.task import Task
from app.services.confidence_service import ConfidenceService
from app.services.mission_context import MissionContext


class FakeMissionRepository:
    def update_mission(self, mission_id: str, user_id: str, data):
        return Mission(
            id=mission_id,
            user_id=user_id,
            title="Test Mission",
            deadline=date(2026, 8, 1),
            confidence_score=data.confidence_score or 50,
            risk_level=data.risk_level or RiskLevel.MEDIUM,
        )


class FakeContextLoader:
    def load(self, mission_id: str, user_id: str, today: date | None = None) -> MissionContext:
        today = today or date(2026, 6, 26)
        mission = Mission(
            id=mission_id,
            user_id=user_id,
            title="Test Mission",
            deadline=date(2026, 8, 1),
            confidence_score=60,
            risk_level=RiskLevel.MEDIUM,
            next_best_action="Practice arrays",
        )
        tasks = [
            Task(
                id="t1",
                user_id=user_id,
                mission_id=mission_id,
                title="Task 1",
                status=TaskStatus.COMPLETED,
                scheduled_date=date(2026, 6, 25),
                priority=TaskPriority.HIGH,
            ),
            Task(
                id="t2",
                user_id=user_id,
                mission_id=mission_id,
                title="Task 2",
                status=TaskStatus.PENDING,
                scheduled_date=date(2026, 6, 20),
                priority=TaskPriority.HIGH,
            ),
        ]
        milestones = [
            Milestone(
                id="m1",
                user_id=user_id,
                mission_id=mission_id,
                title="Milestone 1",
                status=MilestoneStatus.IN_PROGRESS,
            )
        ]
        return MissionContext(
            mission=mission,
            milestones=milestones,
            tasks=tasks,
            reflections=[],
            today=today,
        )


def test_confidence_service_computes_score() -> None:
    service = ConfidenceService(
        context_loader=FakeContextLoader(),
        mission_repository=FakeMissionRepository(),
        risk_analyzer=RiskAnalyzer(),
    )

    result = service.compute_confidence("mission-1", "user-1")

    assert 0 <= result.score <= 100
    assert result.trend in {"improving", "declining", "stable"}
    assert result.recommended_action
