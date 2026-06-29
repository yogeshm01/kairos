from app.repositories.user_repository import UserRepository
from app.schemas.user import AuthenticatedUser, UserProfile


class UserService:
    def __init__(self, repository: UserRepository | None = None) -> None:
        self.repository = repository or UserRepository()

    def sync_authenticated_user(self, user: AuthenticatedUser) -> UserProfile:
        return self.repository.upsert_from_auth(user)

