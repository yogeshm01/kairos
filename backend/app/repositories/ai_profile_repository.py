from app.repositories.base import FirestoreRepository
from app.schemas.ai_profile import AIProfile, AIProfileCreate, AIProfileUpdate


class AIProfileRepository(FirestoreRepository[AIProfile]):
    collection_name = "ai_profiles"
    schema = AIProfile

    def get_by_user(self, user_id: str) -> AIProfile | None:
        snapshots = (
            self.collection.where("user_id", "==", user_id).limit(1).stream()
        )
        for snapshot in snapshots:
            return self._document_to_schema(snapshot.id, snapshot.to_dict() or {})
        return None

    def upsert_by_user(self, user_id: str, data: AIProfileCreate | AIProfileUpdate) -> AIProfile:
        existing = self.get_by_user(user_id)
        if existing:
            return self.update_owned(existing.id, user_id, data)
        return self.create(data, user_id)
