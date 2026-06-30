from app.repositories.ai_profile_repository import AIProfileRepository
from app.schemas.ai_profile import AIProfile, AIProfileCreate, AIProfileUpdate


class AIProfileService:
    def __init__(self, repository: AIProfileRepository | None = None) -> None:
        self.repository = repository or AIProfileRepository()

    def get_profile(self, user_id: str) -> AIProfile | None:
        return self.repository.get_by_user(user_id)

    def create_or_update_profile(self, user_id: str, data: AIProfileCreate) -> AIProfile:
        return self.repository.upsert_by_user(user_id, data)

    def update_profile(self, user_id: str, data: AIProfileUpdate) -> AIProfile | None:
        existing = self.repository.get_by_user(user_id)
        if not existing:
            return None
        return self.repository.upsert_by_user(user_id, data)

    def mark_onboarding_completed(self, user_id: str) -> AIProfile | None:
        existing = self.repository.get_by_user(user_id)
        if not existing:
            return None
        update_data = AIProfileUpdate(
            onboarding_completed=True,
            **existing.model_dump(exclude_none=True)
        )
        return self.repository.upsert_by_user(user_id, update_data)
