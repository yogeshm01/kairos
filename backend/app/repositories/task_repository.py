from datetime import UTC, datetime

from app.repositories.base import FirestoreRepository, encode_firestore_data
from app.schemas.common import TaskStatus
from app.schemas.task import Task, TaskCreate, TaskUpdate


class TaskRepository(FirestoreRepository[Task]):
    collection_name = "tasks"
    schema = Task

    def create_task(self, data: TaskCreate, user_id: str) -> Task:
        return self.create(data, user_id)

    def list_for_mission(self, mission_id: str, user_id: str, limit: int = 200) -> list[Task]:
        snapshots = (
            self.collection.where("user_id", "==", user_id)
            .where("mission_id", "==", mission_id)
            .order_by("order_index")
            .limit(limit)
            .stream()
        )
        return [self._document_to_schema(snapshot.id, snapshot.to_dict() or {}) for snapshot in snapshots]

    def update_task(self, task_id: str, user_id: str, data: TaskUpdate) -> Task | None:
        payload = data.model_dump(exclude_none=True)
        if payload.get("status") == TaskStatus.COMPLETED:
            payload["completed_at"] = datetime.now(UTC)

        return self.update_owned(task_id, user_id, TaskUpdate(**payload))

    def get_task(self, task_id: str, user_id: str) -> Task | None:
        return self.get_owned(task_id, user_id)

    def mark_status(self, task_id: str, user_id: str, status: TaskStatus) -> Task | None:
        payload = {"status": status}
        if status == TaskStatus.COMPLETED:
            payload["completed_at"] = datetime.now(UTC)

        existing = self.get_owned(task_id, user_id)
        if existing is None:
            return None

        encoded = encode_firestore_data(payload)
        encoded["updated_at"] = datetime.now(UTC)
        self.collection.document(task_id).set(encoded, merge=True)
        return self._document_to_schema(task_id, {**existing.model_dump(), **encoded})

