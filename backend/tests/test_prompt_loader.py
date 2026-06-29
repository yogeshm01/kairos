from pathlib import Path

import pytest

from app.services.prompt_loader import PromptLoader, PromptNotFoundError


def test_prompt_loader_reads_prompt_template(tmp_path: Path) -> None:
    prompt_path = tmp_path / "example.md"
    prompt_path.write_text("Hello {{name}}", encoding="utf-8")

    loader = PromptLoader(prompt_dir=tmp_path)

    assert loader.load("example") == "Hello {{name}}"


def test_prompt_loader_raises_for_missing_prompt(tmp_path: Path) -> None:
    loader = PromptLoader(prompt_dir=tmp_path)

    with pytest.raises(PromptNotFoundError):
        loader.load("missing")
