from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client

from app.core.config import settings


class FirebaseNotConfiguredError(RuntimeError):
    pass


def _private_key() -> str:
    return settings.firebase_private_key.replace("\\n", "\n")


def _has_service_account_config() -> bool:
    return all(
        [
            settings.firebase_project_id,
            settings.firebase_client_email,
            settings.firebase_private_key,
        ]
    )


@lru_cache
def get_firebase_app() -> firebase_admin.App:
    if firebase_admin._apps:
        return firebase_admin.get_app()

    if not _has_service_account_config():
        raise FirebaseNotConfiguredError(
            "Firebase Admin credentials are not configured. Set FIREBASE_PROJECT_ID, "
            "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
        )

    certificate = credentials.Certificate(
        {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key": _private_key(),
            "client_email": settings.firebase_client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    )

    options = {}
    if settings.firebase_storage_bucket:
        options["storageBucket"] = settings.firebase_storage_bucket

    return firebase_admin.initialize_app(certificate, options)


@lru_cache
def get_firestore_client() -> Client:
    get_firebase_app()
    return firestore.client()

