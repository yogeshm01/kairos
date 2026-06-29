from datetime import date, datetime

from enum import StrEnum

from pydantic import BaseModel, Field

from app.schemas.common import MissionStatus, RiskLevel, utc_now


class IntensityPreference(StrEnum):
    LIGHT = "light"
    BALANCED = "balanced"
    INTENSE = "intense"


class MissionBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    deadline: date
    why_it_matters: str | None = Field(default=None, max_length=2000)
    available_minutes_per_day: int | None = Field(default=None, ge=15, le=1440)
    intensity_preference: IntensityPreference = IntensityPreference.BALANCED


class MissionCreate(MissionBase):
    pass


class MissionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    status: MissionStatus | None = None
    confidence_score: int | None = Field(default=None, ge=0, le=100)
    risk_level: RiskLevel | None = None
    next_best_action: str | None = Field(default=None, max_length=280)


class Mission(MissionBase):
    id: str
    user_id: str
    status: MissionStatus = MissionStatus.ACTIVE
    confidence_score: int = Field(default=50, ge=0, le=100)
    risk_level: RiskLevel = RiskLevel.MEDIUM
    next_best_action: str | None = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

