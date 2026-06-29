from datetime import date

from app.repositories.base import FirestoreRepository
from app.schemas.daily_plan import DailyPlan, DailyPlanCreate, DailyPlanUpdate


class DailyPlanRepository(FirestoreRepository[DailyPlan]):
    collection_name = "daily_plans"
    schema = DailyPlan

    def create_daily_plan(self, data: DailyPlanCreate, user_id: str) -> DailyPlan:
        return self.create(data, user_id)

    def get_for_date(self, mission_id: str, user_id: str, plan_date: date) -> DailyPlan | None:
        snapshots = (
            self.collection.where("user_id", "==", user_id)
            .where("mission_id", "==", mission_id)
            .where("plan_date", "==", plan_date.isoformat())
            .limit(1)
            .stream()
        )
        for snapshot in snapshots:
            return self._document_to_schema(snapshot.id, snapshot.to_dict() or {})
        return None

    def list_for_mission(self, mission_id: str, user_id: str, limit: int = 60) -> list[DailyPlan]:
        snapshots = (
            self.collection.where("user_id", "==", user_id)
            .where("mission_id", "==", mission_id)
            .order_by("plan_date")
            .limit(limit)
            .stream()
        )
        return [self._document_to_schema(snapshot.id, snapshot.to_dict() or {}) for snapshot in snapshots]

    def update_daily_plan(
        self, daily_plan_id: str, user_id: str, data: DailyPlanUpdate
    ) -> DailyPlan | None:
        return self.update_owned(daily_plan_id, user_id, data)

