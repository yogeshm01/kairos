from datetime import date

from pydantic import BaseModel

from app.repositories.base import encode_firestore_data


class NestedPayload(BaseModel):
    run_date: date


def test_encode_firestore_data_converts_dates_to_iso_strings() -> None:
    payload = {
        "deadline": date(2026, 7, 30),
        "nested": NestedPayload(run_date=date(2026, 7, 1)),
        "items": [date(2026, 7, 2)],
    }

    encoded = encode_firestore_data(payload)

    assert encoded == {
        "deadline": "2026-07-30",
        "nested": {"run_date": "2026-07-01"},
        "items": ["2026-07-02"],
    }
