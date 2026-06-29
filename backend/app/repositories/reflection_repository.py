from app.repositories.base import FirestoreRepository
from app.schemas.reflection import Reflection, ReflectionCreate, ReflectionUpdate


class ReflectionRepository(FirestoreRepository[Reflection]):
    collection_name = "reflections"
    schema = Reflection

    def create_reflection(self, data: ReflectionCreate, user_id: str) -> Reflection:
        return self.create(data, user_id)

    def list_for_mission(self, mission_id: str, user_id: str, limit: int = 30) -> list[Reflection]:
        snapshots = (
            self.collection.where("user_id", "==", user_id)
            .where("mission_id", "==", mission_id)
            .order_by("reflection_date")
            .limit(limit)
            .stream()
        )
        return [self._document_to_schema(snapshot.id, snapshot.to_dict() or {}) for snapshot in snapshots]

    def update_reflection(
        self, reflection_id: str, user_id: str, data: ReflectionUpdate
    ) -> Reflection | None:
        return self.update_owned(reflection_id, user_id, data)

