from app.repositories.base import FirestoreRepository
from app.schemas.milestone import Milestone, MilestoneCreate, MilestoneUpdate


class MilestoneRepository(FirestoreRepository[Milestone]):
    collection_name = "milestones"
    schema = Milestone

    def create_milestone(self, data: MilestoneCreate, user_id: str) -> Milestone:
        return self.create(data, user_id)

    def list_for_mission(self, mission_id: str, user_id: str, limit: int = 100) -> list[Milestone]:
        snapshots = (
            self.collection.where("user_id", "==", user_id)
            .where("mission_id", "==", mission_id)
            .order_by("order_index")
            .limit(limit)
            .stream()
        )
        return [self._document_to_schema(snapshot.id, snapshot.to_dict() or {}) for snapshot in snapshots]

    def update_milestone(
        self, milestone_id: str, user_id: str, data: MilestoneUpdate
    ) -> Milestone | None:
        return self.update_owned(milestone_id, user_id, data)

