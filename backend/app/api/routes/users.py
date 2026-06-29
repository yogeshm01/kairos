from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas.user import AuthenticatedUser, UserProfile
from app.services.user_service import UserService

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserProfile)
def get_me(current_user: AuthenticatedUser = Depends(get_current_user)) -> UserProfile:
    return UserService().sync_authenticated_user(current_user)
