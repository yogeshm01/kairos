from app.repositories.base import FirestoreRepository
from app.schemas.ai_event import AiEvent, AiEventCreate


class AiEventRepository(FirestoreRepository[AiEvent]):
    collection_name = "ai_events"
    schema = AiEvent

    def create_event(self, data: AiEventCreate, user_id: str) -> AiEvent:
        return self.create(data, user_id)

    def list_for_mission(self, mission_id: str, user_id: str, limit: int = 50) -> list[AiEvent]:
        snapshots = (
            self.collection.where("user_id", "==", user_id)
            .where("mission_id", "==", mission_id)
            .order_by("created_at")
            .limit(limit)
            .stream()
        )
        return [self._document_to_schema(snapshot.id, snapshot.to_dict() or {}) for snapshot in snapshots]

