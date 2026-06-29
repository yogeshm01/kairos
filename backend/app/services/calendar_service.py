from datetime import UTC, date, datetime, timedelta

from app.core.errors import not_found, service_unavailable
from app.repositories.user_repository import UserRepository
from app.schemas.calendar import (
    CalendarConnectRequest,
    CalendarEvent,
    CalendarStatusResponse,
    CalendarSyncResponse,
)
from app.services.dashboard_service import DailyPlanService
from app.services.mission_context_loader import MissionContextLoader


class CalendarService:
    def __init__(
        self,
        user_repository: UserRepository | None = None,
        context_loader: MissionContextLoader | None = None,
        daily_plan_service: DailyPlanService | None = None,
    ) -> None:
        self.user_repository = user_repository or UserRepository()
        self.context_loader = context_loader or MissionContextLoader()
        self.daily_plan_service = daily_plan_service or DailyPlanService()

    def connect_calendar(self, user_id: str, payload: CalendarConnectRequest) -> CalendarStatusResponse:
        self.user_repository.save_calendar_credentials(
            user_id,
            refresh_token=payload.refresh_token,
            calendar_id=payload.calendar_id,
        )
        return CalendarStatusResponse(
            connected=True,
            calendar_id=payload.calendar_id,
            message="Google Calendar connected.",
        )

    def get_status(self, user_id: str) -> CalendarStatusResponse:
        credentials = self.user_repository.get_calendar_credentials(user_id)
        if not credentials:
            return CalendarStatusResponse(
                connected=False,
                message="Google Calendar is not connected.",
            )
        return CalendarStatusResponse(
            connected=True,
            calendar_id=credentials.get("calendar_id"),
            message="Google Calendar is connected.",
        )

    def sync_today_plan(
        self,
        mission_id: str,
        user_id: str,
        plan_date: date | None = None,
    ) -> CalendarSyncResponse:
        self.context_loader.load(mission_id, user_id)
        credentials = self.user_repository.get_calendar_credentials(user_id)
        if not credentials:
            raise service_unavailable("Connect Google Calendar before syncing.")

        target_date = plan_date or date.today()
        today_view = self.daily_plan_service.get_today_view(mission_id, user_id)
        events = self._build_events(today_view.tasks, target_date)

        return CalendarSyncResponse(
            mission_id=mission_id,
            synced_events=events,
            status="synced",
            message=(
                f"Prepared {len(events)} calendar events for {target_date.isoformat()}. "
                "Full Google Calendar API push requires production OAuth credentials."
            ),
        )

    def list_events(self, user_id: str) -> list[CalendarEvent]:
        credentials = self.user_repository.get_calendar_credentials(user_id)
        if not credentials:
            raise service_unavailable("Connect Google Calendar before listing events.")
        return []

    def _build_events(self, tasks, plan_date: date) -> list[CalendarEvent]:
        events: list[CalendarEvent] = []
        cursor = datetime.combine(plan_date, datetime.min.time(), tzinfo=UTC) + timedelta(hours=9)

        for item in tasks:
            minutes = item.task.estimated_minutes or 30
            end = cursor + timedelta(minutes=minutes)
            events.append(
                CalendarEvent(
                    title=item.task.title,
                    start=cursor,
                    end=end,
                    description=item.why_it_matters or item.task.description,
                )
            )
            cursor = end + timedelta(minutes=15)

        return events
