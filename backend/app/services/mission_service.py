from app.core.errors import bad_gateway, not_found, service_unavailable
from app.modules.orchestrator.mission_orchestrator import MissionOrchestrator
from app.repositories.mission_repository import MissionRepository
from app.schemas.mission import Mission, MissionCreate, MissionUpdate
from app.schemas.mission_plan import MissionPlanResponse
from app.services.gemini_service import GeminiConfigurationError, GeminiResponseError


class MissionService:
    def __init__(
        self,
        repository: MissionRepository | None = None,
        orchestrator: MissionOrchestrator | None = None,
    ) -> None:
        self.repository = repository or MissionRepository()
        self.orchestrator = orchestrator

    def create_mission(self, data: MissionCreate, user_id: str) -> MissionPlanResponse:
        orchestrator = self.orchestrator or MissionOrchestrator(mission_repository=self.repository)
        try:
            return orchestrator.create_mission_plan(data, user_id)
        except GeminiConfigurationError as exc:
            raise service_unavailable(str(exc)) from exc
        except GeminiResponseError as exc:
            raise bad_gateway(str(exc)) from exc

    def list_missions(self, user_id: str) -> list[Mission]:
        return self.repository.list_missions(user_id)

    def get_mission(self, mission_id: str, user_id: str) -> Mission:
        mission = self.repository.get_mission(mission_id, user_id)
        if mission is None:
            raise not_found("Mission not found")
        return mission

    def update_mission(self, mission_id: str, user_id: str, data: MissionUpdate) -> Mission:
        mission = self.repository.update_mission(mission_id, user_id, data)
        if mission is None:
            raise not_found("Mission not found")
        return mission
