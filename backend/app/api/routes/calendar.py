from datetime import date

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas.calendar import (
    CalendarConnectRequest,
    CalendarEvent,
    CalendarStatusResponse,
    CalendarSyncRequest,
    CalendarSyncResponse,
)
from app.schemas.user import AuthenticatedUser
from app.services.calendar_service import CalendarService

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.post("/connect", response_model=CalendarStatusResponse)
def connect_calendar(
    payload: CalendarConnectRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> CalendarStatusResponse:
    return CalendarService().connect_calendar(current_user.uid, payload)


@router.get("/status", response_model=CalendarStatusResponse)
def calendar_status(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> CalendarStatusResponse:
    return CalendarService().get_status(current_user.uid)


@router.get("/events", response_model=list[CalendarEvent])
def list_calendar_events(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> list[CalendarEvent]:
    return CalendarService().list_events(current_user.uid)


@router.post("/missions/{mission_id}/sync", response_model=CalendarSyncResponse)
def sync_mission_calendar(
    mission_id: str,
    payload: CalendarSyncRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> CalendarSyncResponse:
    plan_date = date.fromisoformat(payload.plan_date) if payload.plan_date else None
    return CalendarService().sync_today_plan(mission_id, current_user.uid, plan_date)
