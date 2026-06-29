from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from app.core.errors import service_unavailable, unauthorized
from app.core.firebase import FirebaseNotConfiguredError, get_firebase_app
from app.schemas.user import AuthenticatedUser

bearer_scheme = HTTPBearer(auto_error=False)


def verify_firebase_token(token: str) -> AuthenticatedUser:
    try:
        get_firebase_app()
        decoded_token = auth.verify_id_token(token)
    except FirebaseNotConfiguredError as exc:
        raise service_unavailable(str(exc)) from exc
    except Exception as exc:
        raise unauthorized("Invalid or expired authentication token") from exc

    return AuthenticatedUser(
        uid=decoded_token["uid"],
        email=decoded_token.get("email"),
        name=decoded_token.get("name"),
        picture=decoded_token.get("picture"),
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthenticatedUser:
    if credentials is None:
        raise unauthorized()

    return verify_firebase_token(credentials.credentials)

