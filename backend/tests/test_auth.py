from fastapi.testclient import TestClient

from app.main import app


def test_me_requires_authentication() -> None:
    client = TestClient(app)

    response = client.get("/api/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Authentication required"}
