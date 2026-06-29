from datetime import datetime

from pydantic import BaseModel, Field


class CalendarConnectRequest(BaseModel):
    refresh_token: str = Field(min_length=1)
    calendar_id: str = Field(default="primary", min_length=1)


class CalendarSyncRequest(BaseModel):
    plan_date: str | None = None


class CalendarEvent(BaseModel):
    id: str | None = None
    title: str
    start: datetime
    end: datetime
    description: str | None = None


class CalendarSyncResponse(BaseModel):
    mission_id: str
    synced_events: list[CalendarEvent] = Field(default_factory=list)
    status: str
    message: str


class CalendarStatusResponse(BaseModel):
    connected: bool
    calendar_id: str | None = None
    message: str
