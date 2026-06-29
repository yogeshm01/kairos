from app.core.errors import bad_gateway, not_found, service_unavailable
from app.modules.reflection.reflection_engine import ReflectionEngine
from app.repositories.ai_event_repository import AiEventRepository
from app.repositories.mission_repository import MissionRepository
from app.repositories.reflection_repository import ReflectionRepository
from app.schemas.ai_event import AiEventCreate
from app.schemas.common import AiEventType
from app.schemas.mission import MissionUpdate
from app.schemas.reflection import Reflection, ReflectionCreate, ReflectionUpdate
from app.services.confidence_service import ConfidenceService
from app.services.gemini_service import GeminiConfigurationError, GeminiResponseError
from app.services.mission_context_loader import MissionContextLoader


class ReflectionService:
    def __init__(
        self,
        context_loader: MissionContextLoader | None = None,
        reflection_repository: ReflectionRepository | None = None,
        reflection_engine: ReflectionEngine | None = None,
        mission_repository: MissionRepository | None = None,
        confidence_service: ConfidenceService | None = None,
        ai_event_repository: AiEventRepository | None = None,
    ) -> None:
        self.context_loader = context_loader or MissionContextLoader()
        self.reflection_repository = reflection_repository or ReflectionRepository()
        self.reflection_engine = reflection_engine or ReflectionEngine()
        self.mission_repository = mission_repository or MissionRepository()
        self.confidence_service = confidence_service or ConfidenceService()
        self.ai_event_repository = ai_event_repository or AiEventRepository()

    def create_reflection(
        self,
        mission_id: str,
        user_id: str,
        payload: ReflectionCreate,
    ) -> Reflection:
        context = self.context_loader.load(mission_id, user_id)
        try:
            analysis = self.reflection_engine.analyze_reflection(context, payload)
        except GeminiConfigurationError as exc:
            raise service_unavailable(str(exc)) from exc
        except GeminiResponseError as exc:
            raise bad_gateway(str(exc)) from exc

        reflection = self.reflection_repository.create_reflection(payload, user_id)
        updated = self.reflection_repository.update_reflection(
            reflection.id,
            user_id,
            ReflectionUpdate(ai_insight=analysis.ai_insight),
        )
        if updated is None:
            raise not_found("Reflection not found after creation")

        new_confidence = max(
            0,
            min(100, context.mission.confidence_score + analysis.confidence_adjustment),
        )
        self.mission_repository.update_mission(
            mission_id,
            user_id,
            MissionUpdate(
                confidence_score=new_confidence,
                risk_level=analysis.risk_adjustment,
                next_best_action=analysis.recommended_action,
            ),
        )
        self.confidence_service.compute_confidence(mission_id, user_id)

        self.ai_event_repository.create_event(
            AiEventCreate(
                mission_id=mission_id,
                event_type=AiEventType.REFLECTION_ANALYZED,
                module_name="reflection_engine",
                input_snapshot=payload.model_dump(mode="json"),
                output_snapshot=analysis.model_dump(mode="json"),
            ),
            user_id,
        )
        return updated

    def list_reflections(self, mission_id: str, user_id: str) -> list[Reflection]:
        self.context_loader.load(mission_id, user_id)
        return self.reflection_repository.list_for_mission(mission_id, user_id)
