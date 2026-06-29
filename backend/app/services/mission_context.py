from dataclasses import dataclass
from datetime import date

from app.schemas.common import TaskStatus
from app.schemas.milestone import Milestone
from app.schemas.mission import Mission
from app.schemas.reflection import Reflection
from app.schemas.task import Task


@dataclass
class MissionContext:
    mission: Mission
    milestones: list[Milestone]
    tasks: list[Task]
    reflections: list[Reflection]
    today: date

    def tasks_for_today(self) -> list[Task]:
        return [
            task
            for task in self.tasks
            if task.scheduled_date == self.today
            and task.status not in (TaskStatus.COMPLETED, TaskStatus.SKIPPED)
        ]

    def overdue_tasks(self) -> list[Task]:
        return [
            task
            for task in self.tasks
            if task.scheduled_date is not None
            and task.scheduled_date < self.today
            and task.status not in (TaskStatus.COMPLETED, TaskStatus.SKIPPED)
        ]

    def completion_rate(self) -> float:
        if not self.tasks:
            return 0.0
        completed = sum(1 for task in self.tasks if task.status == TaskStatus.COMPLETED)
        return completed / len(self.tasks)

    def to_ai_snapshot(self) -> dict:
        return {
            "today": self.today.isoformat(),
            "mission": self.mission.model_dump(mode="json"),
            "milestones": [m.model_dump(mode="json") for m in self.milestones],
            "tasks": [t.model_dump(mode="json") for t in self.tasks],
            "reflections": [r.model_dump(mode="json") for r in self.recent_reflections()],
            "completion_rate": round(self.completion_rate(), 2),
            "overdue_task_count": len(self.overdue_tasks()),
        }

    def recent_reflections(self, limit: int = 5) -> list[Reflection]:
        return sorted(self.reflections, key=lambda r: r.reflection_date, reverse=True)[:limit]
