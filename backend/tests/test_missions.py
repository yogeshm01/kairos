from fastapi.testclient import TestClient

from app.main import app


def test_missions_requires_authentication() -> None:
    client = TestClient(app)

    response = client.get("/api/missions")

    assert response.status_code == 401
    assert response.json() == {"detail": "Authentication required"}


def test_create_mission_requires_authentication() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/missions",
        json={
            "title": "Crack Google Internship",
            "description": "Prepare for technical and behavioral rounds.",
            "deadline": "2026-07-30",
            "why_it_matters": "This internship is my top goal.",
            "available_minutes_per_day": 120,
        },
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Authentication required"}
