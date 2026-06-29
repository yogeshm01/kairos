from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import AiEventType, utc_now


class AiEventCreate(BaseModel):
    mission_id: str
    event_type: AiEventType
    module_name: str = Field(min_length=1, max_length=120)
    input_snapshot: dict[str, Any] = Field(default_factory=dict)
    output_snapshot: dict[str, Any] = Field(default_factory=dict)
    model: str | None = None


class AiEvent(BaseModel):
    id: str
    user_id: str
    mission_id: str
    event_type: AiEventType
    module_name: str
    input_snapshot: dict[str, Any] = Field(default_factory=dict)
    output_snapshot: dict[str, Any] = Field(default_factory=dict)
    model: str | None = None
    created_at: datetime = Field(default_factory=utc_now)

