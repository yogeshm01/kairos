import json
import logging
import time
from typing import TypeVar

from google import genai
from pydantic import BaseModel, ValidationError

from app.core.config import settings

OutputT = TypeVar("OutputT", bound=BaseModel)

logger = logging.getLogger(__name__)


class GeminiConfigurationError(RuntimeError):
    pass


class GeminiResponseError(RuntimeError):
    pass


class GeminiService:
    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        max_retries: int = 3,
        retry_delay_seconds: float = 0.5,
    ) -> None:
        self.api_key = api_key or settings.gemini_api_key
        self.model = model or settings.gemini_model
        self.max_retries = max_retries
        self.retry_delay_seconds = retry_delay_seconds
        if not self.api_key:
            raise GeminiConfigurationError("GEMINI_API_KEY is not configured.")
        self.client = genai.Client(api_key=self.api_key)

    def generate_structured(
        self,
        prompt: str,
        output_schema: type[OutputT],
        temperature: float = 0.25,
    ) -> OutputT:
        last_error: Exception | None = None

        for attempt in range(1, self.max_retries + 1):
            try:
                return self._generate_once(prompt, output_schema, temperature)
            except (GeminiResponseError, ValidationError, json.JSONDecodeError) as exc:
                last_error = exc
                logger.warning(
                    "Gemini structured generation failed on attempt %s/%s: %s",
                    attempt,
                    self.max_retries,
                    exc,
                )
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay_seconds * attempt)

        raise GeminiResponseError(
            f"Gemini failed after {self.max_retries} attempts."
        ) from last_error

    def _generate_once(
        self,
        prompt: str,
        output_schema: type[OutputT],
        temperature: float,
    ) -> OutputT:
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "temperature": temperature,
            },
        )

        raw_text = getattr(response, "text", None)
        if not raw_text:
            raise GeminiResponseError("Gemini returned an empty response.")

        try:
            payload = json.loads(raw_text)
            return output_schema.model_validate(payload)
        except json.JSONDecodeError as exc:
            raise GeminiResponseError("Gemini returned invalid JSON.") from exc
        except ValidationError as exc:
            raise GeminiResponseError("Gemini response did not match the expected schema.") from exc

