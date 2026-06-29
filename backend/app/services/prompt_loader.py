import json
from pathlib import Path
from typing import Any


class PromptNotFoundError(FileNotFoundError):
    pass


class PromptLoader:
    def __init__(self, prompt_dir: Path | None = None) -> None:
        self.prompt_dir = prompt_dir or Path(__file__).resolve().parents[1] / "prompts"

    def load(self, name: str) -> str:
        path = self.prompt_dir / f"{name}.md"
        if not path.exists():
            raise PromptNotFoundError(f"Prompt template not found: {name}")
        return path.read_text(encoding="utf-8")

    def render(self, name: str, variables: dict[str, Any]) -> str:
        template = self.load(name)
        rendered = template
        for key, value in variables.items():
            placeholder = f"{{{{{key}}}}}"
            if isinstance(value, (dict, list)):
                rendered = rendered.replace(placeholder, json.dumps(value, indent=2))
            else:
                rendered = rendered.replace(placeholder, str(value))
        return rendered

