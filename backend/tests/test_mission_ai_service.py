import json
from datetime import date

from app.schemas.mission import MissionCreate
from app.services.mission_ai_service import MissionAiService


class FakePromptLoader:
    def load(self, name: str) -> str:
        assert name == "mission_analysis"
        return "Analyze this:\n{{mission_input}}"

    def render(self, name: str, variables: dict) -> str:
        template = self.load(name)
        for key, value in variables.items():
            if isinstance(value, (dict, list)):
                rendered = json.dumps(value, indent=2)
            else:
                rendered = str(value)
            template = template.replace(f"{{{{{key}}}}}", rendered)
        return template


def test_mission_ai_service_builds_prompt() -> None:
    mission = MissionCreate(
        title="Crack Google Internship",
        description="Prepare for DSA and mock interviews.",
        deadline=date(2026, 7, 30),
        why_it_matters="It is my top career goal.",
        available_minutes_per_day=120,
    )
    service = MissionAiService(prompt_loader=FakePromptLoader())

    prompt = service._build_prompt(mission, today=date(2026, 6, 26))

    assert "Crack Google Internship" in prompt
    assert '"today": "2026-06-26"' in prompt
    assert '"deadline": "2026-07-30"' in prompt
