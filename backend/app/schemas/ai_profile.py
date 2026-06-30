from datetime import datetime
from enum import StrEnum
from pydantic import BaseModel, Field
from app.schemas.common import utc_now


class WorkStyle(StrEnum):
    MORNING_PERSON = "morning_person"
    NIGHT_OWL = "night_owl"
    FLEXIBLE = "flexible"
    BURST_WORKER = "burst_worker"


class ReminderStyle(StrEnum):
    GENTLE = "gentle"
    DIRECT = "direct"
    MOTIVATIONAL = "motivational"
    MINIMAL = "minimal"


class FocusEnvironment(StrEnum):
    QUIET = "quiet"
    BACKGROUND_NOISE = "background_noise"
    MUSIC = "music"
    CAFE = "cafe"
    VARIES = "varies"


class AIProfileBase(BaseModel):
    occupation: str | None = Field(default=None, max_length=200)
    productive_hours_start: int | None = Field(default=None, ge=0, le=23)
    productive_hours_end: int | None = Field(default=None, ge=0, le=23)
    daily_available_minutes: int | None = Field(default=None, ge=15, le=1440)
    work_style: WorkStyle | None = None
    reminder_style: ReminderStyle | None = None
    focus_environment: FocusEnvironment | None = None
    common_distractions: str | None = Field(default=None, max_length=1000)
    preferred_task_length: int | None = Field(default=None, ge=5, le=480)
    break_frequency_minutes: int | None = Field(default=None, ge=15, le=180)
    energy_patterns: str | None = Field(default=None, max_length=1000)
    goals_and_motivations: str | None = Field(default=None, max_length=2000)
    constraints: str | None = Field(default=None, max_length=2000)


class AIProfileCreate(AIProfileBase):
    pass


class AIProfileUpdate(AIProfileBase):
    pass


class AIProfile(AIProfileBase):
    id: str
    user_id: str
    onboarding_completed: bool = False
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
