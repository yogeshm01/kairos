from app.core.errors import bad_gateway, service_unavailable
from app.modules.coach.coach import Coach
from app.repositories.ai_event_repository import AiEventRepository
from app.schemas.ai_event import AiEventCreate
from app.schemas.coach import CoachMessageResponse
from app.schemas.common import AiEventType
from app.services.gemini_service import GeminiConfigurationError, GeminiResponseError
from app.services.mission_context_loader import MissionContextLoader


class CoachService:
    def __init__(
        self,
        context_loader: MissionContextLoader | None = None,
        coach: Coach | None = None,
        ai_event_repository: AiEventRepository | None = None,
    ) -> None:
        self.context_loader = context_loader or MissionContextLoader()
        self.coach = coach or Coach()
        self.ai_event_repository = ai_event_repository or AiEventRepository()

    def get_coach_message(self, mission_id: str, user_id: str) -> CoachMessageResponse:
        context = self.context_loader.load(mission_id, user_id)
        try:
            message = self.coach.generate_message(context)
        except GeminiConfigurationError as exc:
            raise service_unavailable(str(exc)) from exc
        except GeminiResponseError as exc:
            raise bad_gateway(str(exc)) from exc

        self.ai_event_repository.create_event(
            AiEventCreate(
                mission_id=mission_id,
                event_type=AiEventType.COACH_MESSAGE,
                module_name="coach",
                input_snapshot=context.to_ai_snapshot(),
                output_snapshot=message.model_dump(mode="json"),
            ),
            user_id,
        )

        return CoachMessageResponse(
            mission_id=mission_id,
            message=message.message,
            risk_insight=message.risk_insight,
            recommended_action=message.recommended_action,
            tone=message.tone,
        )
