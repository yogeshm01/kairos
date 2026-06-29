from datetime import date, datetime
from typing import Any, Generic, TypeVar

from google.cloud.firestore import Client, CollectionReference
from pydantic import BaseModel

from app.core.firebase import get_firestore_client
from app.schemas.common import utc_now

SchemaT = TypeVar("SchemaT", bound=BaseModel)


def encode_firestore_value(value: Any) -> Any:
    if isinstance(value, BaseModel):
        return encode_firestore_data(value.model_dump(exclude_none=True))
    if isinstance(value, dict):
        return encode_firestore_data(value)
    if isinstance(value, list):
        return [encode_firestore_value(item) for item in value]
    if isinstance(value, date) and not isinstance(value, datetime):
        return value.isoformat()
    return value


def encode_firestore_data(data: dict[str, Any]) -> dict[str, Any]:
    return {key: encode_firestore_value(value) for key, value in data.items()}


class FirestoreRepository(Generic[SchemaT]):
    collection_name: str
    schema: type[SchemaT]

    def __init__(self, db: Client | None = None) -> None:
        self.db = db or get_firestore_client()
        self.collection: CollectionReference = self.db.collection(self.collection_name)

    def _document_to_schema(self, document_id: str, data: dict[str, Any]) -> SchemaT:
        data = {**data}
        data.pop("id", None)
        return self.schema(id=document_id, **data)

    def get_owned(self, document_id: str, user_id: str) -> SchemaT | None:
        snapshot = self.collection.document(document_id).get()
        if not snapshot.exists:
            return None

        data = snapshot.to_dict() or {}
        if data.get("user_id") != user_id:
            return None

        return self._document_to_schema(snapshot.id, data)

    def list_by_user(self, user_id: str, limit: int = 50) -> list[SchemaT]:
        snapshots = (
            self.collection.where("user_id", "==", user_id)
            .order_by("created_at")
            .limit(limit)
            .stream()
        )
        return [self._document_to_schema(snapshot.id, snapshot.to_dict() or {}) for snapshot in snapshots]

    def create(self, data: BaseModel, user_id: str) -> SchemaT:
        now = utc_now()
        payload = encode_firestore_data(
            {
                **data.model_dump(exclude_none=True),
                "user_id": user_id,
                "created_at": now,
                "updated_at": now,
            }
        )
        document = self.collection.document()
        document.set(payload)
        return self._document_to_schema(document.id, payload)

    def update_owned(self, document_id: str, user_id: str, data: BaseModel) -> SchemaT | None:
        existing = self.get_owned(document_id, user_id)
        if existing is None:
            return None

        payload = encode_firestore_data(data.model_dump(exclude_none=True))
        payload["updated_at"] = utc_now()
        self.collection.document(document_id).set(payload, merge=True)
        merged = {**existing.model_dump(), **payload}
        return self._document_to_schema(document_id, merged)

