from pydantic import BaseModel, EmailStr


class AuthenticatedUser(BaseModel):
    uid: str
    email: EmailStr | None = None
    name: str | None = None
    picture: str | None = None


class UserProfile(BaseModel):
    uid: str
    email: EmailStr | None = None
    name: str | None = None
    picture: str | None = None

