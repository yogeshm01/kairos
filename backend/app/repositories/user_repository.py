from datetime import UTC, datetime
from typing import Any

from google.cloud.firestore import Client

from app.core.firebase import get_firestore_client
from app.schemas.user import AuthenticatedUser, UserProfile


class UserRepository:
    def __init__(self, db: Client | None = None) -> None:
        self.db = db or get_firestore_client()
        self.collection = self.db.collection("users")

    def get_by_uid(self, uid: str) -> UserProfile | None:
        snapshot = self.collection.document(uid).get()
        if not snapshot.exists:
            return None

        data = snapshot.to_dict() or {}
        return UserProfile(
            uid=uid,
            email=data.get("email"),
            name=data.get("name"),
            picture=data.get("picture"),
        )

    def upsert_from_auth(self, user: AuthenticatedUser) -> UserProfile:
        now = datetime.now(UTC)
        payload: dict[str, Any] = {
            "uid": user.uid,
            "email": user.email,
            "name": user.name,
            "picture": user.picture,
            "updated_at": now,
        }

        document = self.collection.document(user.uid)
        existing = document.get()
        if not existing.exists:
            payload["created_at"] = now

        document.set(payload, merge=True)
        return UserProfile(**{key: payload[key] for key in ("uid", "email", "name", "picture")})

    def save_calendar_credentials(
        self,
        user_id: str,
        refresh_token: str,
        calendar_id: str,
    ) -> None:
        now = datetime.now(UTC)
        self.collection.document(user_id).set(
            {
                "calendar_refresh_token": refresh_token,
                "calendar_id": calendar_id,
                "calendar_connected_at": now,
                "updated_at": now,
            },
            merge=True,
        )

    def get_calendar_credentials(self, user_id: str) -> dict[str, Any] | None:
        snapshot = self.collection.document(user_id).get()
        if not snapshot.exists:
            return None

        data = snapshot.to_dict() or {}
        if not data.get("calendar_refresh_token"):
            return None

        return {
            "refresh_token": data.get("calendar_refresh_token"),
            "calendar_id": data.get("calendar_id", "primary"),
        }

