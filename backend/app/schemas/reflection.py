from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.common import utc_now


class ReflectionBase(BaseModel):
    reflection_date: date
    completed_summary: str | None = Field(default=None, max_length=2000)
    blockers: str | None = Field(default=None, max_length=2000)
    confidence: int = Field(ge=0, le=100)
    energy: int = Field(ge=1, le=5)
    notes: str | None = Field(default=None, max_length=2000)


class ReflectionCreate(ReflectionBase):
    mission_id: str


class ReflectionUpdate(BaseModel):
    completed_summary: str | None = Field(default=None, max_length=2000)
    blockers: str | None = Field(default=None, max_length=2000)
    confidence: int | None = Field(default=None, ge=0, le=100)
    energy: int | None = Field(default=None, ge=1, le=5)
    notes: str | None = Field(default=None, max_length=2000)
    ai_insight: str | None = Field(default=None, max_length=2000)


class Reflection(ReflectionBase):
    id: str
    user_id: str
    mission_id: str
    ai_insight: str | None = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

