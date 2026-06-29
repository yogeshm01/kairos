from functools import lru_cache

from app.services.gemini_service import GeminiService
from app.services.prompt_loader import PromptLoader


@lru_cache
def get_prompt_loader() -> PromptLoader:
    return PromptLoader()


def get_gemini_service() -> GeminiService:
    return GeminiService()
