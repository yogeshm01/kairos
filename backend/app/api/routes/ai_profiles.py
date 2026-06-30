from fastapi import APIRouter, Depends, status

from app.core.security import get_current_user
from app.schemas.ai_profile import AIProfile, AIProfileCreate, AIProfileUpdate
from app.schemas.user import AuthenticatedUser
from app.services.ai_profile_service import AIProfileService

router = APIRouter(prefix="/ai-profiles", tags=["ai-profiles"])


@router.get("/me", response_model=AIProfile)
def get_my_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AIProfile | None:
    return AIProfileService().get_profile(current_user.uid)


@router.post("/me", response_model=AIProfile, status_code=status.HTTP_201_CREATED)
def create_or_update_profile(
    payload: AIProfileCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AIProfile:
    return AIProfileService().create_or_update_profile(current_user.uid, payload)


@router.patch("/me", response_model=AIProfile)
def update_profile(
    payload: AIProfileUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AIProfile | None:
    return AIProfileService().update_profile(current_user.uid, payload)


@router.post("/me/complete-onboarding", response_model=AIProfile)
def complete_onboarding(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> AIProfile | None:
    return AIProfileService().mark_onboarding_completed(current_user.uid)
