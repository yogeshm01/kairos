from app.repositories.base import FirestoreRepository
from app.schemas.mission import Mission, MissionCreate, MissionUpdate


class MissionRepository(FirestoreRepository[Mission]):
    collection_name = "missions"
    schema = Mission

    def create_mission(self, data: MissionCreate, user_id: str) -> Mission:
        return self.create(data, user_id)

    def get_mission(self, mission_id: str, user_id: str) -> Mission | None:
        return self.get_owned(mission_id, user_id)

    def list_missions(self, user_id: str, limit: int = 50) -> list[Mission]:
        return self.list_by_user(user_id, limit)

    def update_mission(
        self, mission_id: str, user_id: str, data: MissionUpdate
    ) -> Mission | None:
        return self.update_owned(mission_id, user_id, data)

    def delete_mission(self, mission_id: str, user_id: str) -> bool:
        existing = self.get_owned(mission_id, user_id)
        if not existing:
            return False
        self.collection.document(mission_id).delete()
        return True

