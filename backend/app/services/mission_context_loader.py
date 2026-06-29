from datetime import date

from app.core.errors import not_found
from app.repositories.milestone_repository import MilestoneRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.reflection_repository import ReflectionRepository
from app.repositories.task_repository import TaskRepository
from app.services.mission_context import MissionContext


class MissionContextLoader:
    def __init__(
        self,
        mission_repository: MissionRepository | None = None,
        milestone_repository: MilestoneRepository | None = None,
        task_repository: TaskRepository | None = None,
        reflection_repository: ReflectionRepository | None = None,
    ) -> None:
        self.mission_repository = mission_repository or MissionRepository()
        self.milestone_repository = milestone_repository or MilestoneRepository()
        self.task_repository = task_repository or TaskRepository()
        self.reflection_repository = reflection_repository or ReflectionRepository()

    def load(self, mission_id: str, user_id: str, today: date | None = None) -> MissionContext:
        mission = self.mission_repository.get_mission(mission_id, user_id)
        if mission is None:
            raise not_found("Mission not found")

        return MissionContext(
            mission=mission,
            milestones=self.milestone_repository.list_for_mission(mission_id, user_id),
            tasks=self.task_repository.list_for_mission(mission_id, user_id),
            reflections=self.reflection_repository.list_for_mission(mission_id, user_id),
            today=today or date.today(),
        )
