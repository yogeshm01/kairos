from app.core.errors import bad_gateway, not_found, service_unavailable
from app.modules.orchestrator.mission_orchestrator import MissionOrchestrator
from app.repositories.ai_profile_repository import AIProfileRepository
from app.repositories.mission_repository import MissionRepository
from app.schemas.ai_profile import AIProfile
from app.schemas.mission import Mission, MissionCreate, MissionUpdate
from app.schemas.mission_plan import MissionPlanResponse
from app.services.gemini_service import GeminiConfigurationError, GeminiResponseError


class MissionService:
    def __init__(
        self,
        repository: MissionRepository | None = None,
        orchestrator: MissionOrchestrator | None = None,
        ai_profile_repository: AIProfileRepository | None = None,
    ) -> None:
        self.repository = repository or MissionRepository()
        self.orchestrator = orchestrator
        self.ai_profile_repository = ai_profile_repository or AIProfileRepository()

    def create_mission(self, data: MissionCreate, user_id: str) -> MissionPlanResponse:
        # Apply AI Profile defaults if available and not explicitly provided
        ai_profile = self.ai_profile_repository.get_by_user(user_id)
        if ai_profile:
            mission_data = self._apply_profile_defaults(data, ai_profile)
        else:
            mission_data = data
        
        orchestrator = self.orchestrator or MissionOrchestrator(mission_repository=self.repository)
        try:
            return orchestrator.create_mission_plan(mission_data, user_id)
        except GeminiConfigurationError as exc:
            raise service_unavailable(str(exc)) from exc
        except GeminiResponseError as exc:
            raise bad_gateway(str(exc)) from exc

    def _apply_profile_defaults(self, data: MissionCreate, profile: AIProfile) -> MissionCreate:
        """Apply AI Profile defaults to mission creation data."""
        mission_dict = data.model_dump(exclude_none=True)
        
        # Apply daily available time if not provided
        if profile.daily_available_minutes and not mission_dict.get("available_minutes_per_day"):
            mission_dict["available_minutes_per_day"] = profile.daily_available_minutes
        
        # Apply intensity preference based on work style if not provided
        if not mission_dict.get("intensity_preference") and profile.work_style:
            from app.schemas.ai_profile import WorkStyle
            from app.schemas.mission import IntensityPreference
            
            intensity_map = {
                WorkStyle.MORNING_PERSON: IntensityPreference.BALANCED,
                WorkStyle.NIGHT_OWL: IntensityPreference.BALANCED,
                WorkStyle.FLEXIBLE: IntensityPreference.BALANCED,
                WorkStyle.BURST_WORKER: IntensityPreference.INTENSE,
            }
            mission_dict["intensity_preference"] = intensity_map.get(profile.work_style, IntensityPreference.BALANCED)
        
        return MissionCreate(**mission_dict)

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

    def delete_mission(self, mission_id: str, user_id: str) -> None:
        deleted = self.repository.delete_mission(mission_id, user_id)
        if not deleted:
            raise not_found("Mission not found")

    def regenerate_mission_plan(self, mission_id: str, user_id: str) -> MissionPlanResponse:
        mission = self.repository.get_mission(mission_id, user_id)
        if mission is None:
            raise not_found("Mission not found")
        
        orchestrator = self.orchestrator or MissionOrchestrator(mission_repository=self.repository)
        try:
            return orchestrator.regenerate_mission_plan(mission_id, user_id)
        except GeminiConfigurationError as exc:
            raise service_unavailable(str(exc)) from exc
        except GeminiResponseError as exc:
            raise bad_gateway(str(exc)) from exc
