from datetime import date

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.schemas.common import TaskStatus
from app.schemas.confidence import ConfidenceResponse
from app.schemas.coach import CoachMessageResponse
from app.schemas.daily_plan import DailyPlan
from app.schemas.dashboard import MissionDashboard, MissionRiskResponse, MissionToday
from app.schemas.mission import Mission, MissionCreate, MissionUpdate
from app.schemas.mission_plan import MissionPlanResponse
from app.schemas.recovery import ApplyRecoveryPlanResponse, RecoveryPlanResponse
from app.schemas.reflection import Reflection, ReflectionCreate
from app.schemas.task import Task
from app.schemas.user import AuthenticatedUser
from app.schemas.weekly_insights import WeeklyInsightsResponse
from app.services.coach_service import CoachService
from app.services.confidence_service import ConfidenceService
from app.services.dashboard_service import DailyPlanService
from app.services.dashboard_service import DashboardService
from app.services.mission_service import MissionService
from app.services.recovery_service import RecoveryService
from app.services.reflection_service import ReflectionService
from app.services.weekly_insights_service import WeeklyInsightsService

router = APIRouter(prefix="/missions", tags=["missions"])


@router.post("", response_model=MissionPlanResponse, status_code=status.HTTP_201_CREATED)
def create_mission(
    payload: MissionCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> MissionPlanResponse:
    return MissionService().create_mission(payload, current_user.uid)


@router.get("", response_model=list[Mission])
def list_missions(current_user: AuthenticatedUser = Depends(get_current_user)) -> list[Mission]:
    return MissionService().list_missions(current_user.uid)


@router.get("/{mission_id}", response_model=Mission)
def get_mission(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Mission:
    return MissionService().get_mission(mission_id, current_user.uid)


@router.patch("/{mission_id}", response_model=Mission)
def update_mission(
    mission_id: str,
    payload: MissionUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Mission:
    return MissionService().update_mission(mission_id, current_user.uid, payload)


@router.delete("/{mission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mission(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> None:
    MissionService().delete_mission(mission_id, current_user.uid)


@router.post("/{mission_id}/regenerate", response_model=MissionPlanResponse)
def regenerate_mission_plan(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> MissionPlanResponse:
    return MissionService().regenerate_mission_plan(mission_id, current_user.uid)


@router.get("/{mission_id}/dashboard", response_model=MissionDashboard)
def get_mission_dashboard(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> MissionDashboard:
    return DashboardService().get_dashboard(mission_id, current_user.uid)


@router.get("/{mission_id}/today", response_model=MissionToday)
def get_mission_today(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> MissionToday:
    return DailyPlanService().get_today_view(mission_id, current_user.uid)


@router.get("/{mission_id}/daily-plan", response_model=DailyPlan)
def get_daily_plan(
    mission_id: str,
    plan_date: date | None = None,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> DailyPlan:
    return DailyPlanService().get_or_create_daily_plan(mission_id, current_user.uid, plan_date)


@router.get("/{mission_id}/risk", response_model=MissionRiskResponse)
def get_mission_risk(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> MissionRiskResponse:
    return DashboardService().get_risk(mission_id, current_user.uid)


@router.get("/{mission_id}/confidence", response_model=ConfidenceResponse)
def get_mission_confidence(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ConfidenceResponse:
    return ConfidenceService().compute_confidence(mission_id, current_user.uid)


@router.post("/{mission_id}/recovery-plan", response_model=RecoveryPlanResponse)
def generate_recovery_plan(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> RecoveryPlanResponse:
    return RecoveryService().generate_recovery_plan(mission_id, current_user.uid)


@router.post("/{mission_id}/apply-recovery-plan", response_model=ApplyRecoveryPlanResponse)
def apply_recovery_plan(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ApplyRecoveryPlanResponse:
    return RecoveryService().apply_recovery_plan(mission_id, current_user.uid)


@router.post("/{mission_id}/reflections", response_model=Reflection, status_code=status.HTTP_201_CREATED)
def create_reflection(
    mission_id: str,
    payload: ReflectionCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Reflection:
    reflection_payload = ReflectionCreate(
        mission_id=mission_id,
        reflection_date=payload.reflection_date,
        completed_summary=payload.completed_summary,
        blockers=payload.blockers,
        confidence=payload.confidence,
        energy=payload.energy,
        notes=payload.notes,
    )
    return ReflectionService().create_reflection(mission_id, current_user.uid, reflection_payload)


@router.get("/{mission_id}/reflections", response_model=list[Reflection])
def list_reflections(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> list[Reflection]:
    return ReflectionService().list_reflections(mission_id, current_user.uid)


@router.get("/{mission_id}/coach-message", response_model=CoachMessageResponse)
def get_coach_message(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> CoachMessageResponse:
    return CoachService().get_coach_message(mission_id, current_user.uid)


@router.get("/{mission_id}/weekly-insights", response_model=WeeklyInsightsResponse)
def get_weekly_insights(
    mission_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> WeeklyInsightsResponse:
    return WeeklyInsightsService().get_weekly_insights(mission_id, current_user.uid)
