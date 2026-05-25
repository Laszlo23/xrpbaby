"""Local dev stub for Emergent LLM integration (Mayor Culture chat)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class UserMessage:
    text: str


class LlmChat:
    def __init__(self, api_key: str, session_id: str, system_message: str) -> None:
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.model_provider = "anthropic"
        self.model_name = "claude-sonnet-4-6"

    def with_model(self, provider: str, model: str) -> LlmChat:
        self.model_provider = provider
        self.model_name = model
        return self

    async def send_message(self, message: UserMessage) -> str:
        if not self.api_key or self.api_key.startswith("replace-with"):
            return (
                "Builder, Mayor Culture is in local demo mode. Set EMERGENT_LLM_KEY in "
                "backend/.env to enable live AI replies. Until then: keep visiting the "
                "ecosystem, complete your daily quests, and invite one friend to light "
                "another house in the village."
            )
        return (
            f"Mayor Culture heard you: “{message.text[:200]}”. "
            "Keep building — the village grows with every quest you complete."
        )
