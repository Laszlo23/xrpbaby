/** LLM routing while 0G bridge/funding is unavailable. */

export type LlmProviderMode = "0g" | "openai" | "auto";

export function resolveLlmProviderMode(): LlmProviderMode {
  const explicit = process.env.AGENT_LLM_PROVIDER?.trim().toLowerCase();
  if (explicit === "0g" || explicit === "openai" || explicit === "auto") {
    return explicit;
  }
  if (process.env.AGENT_BOOTSTRAP_MODE?.trim() === "1") return "auto";
  return "0g";
}

export function openAiKeyAvailable(): boolean {
  return Boolean(
    process.env.AGENT_LLM_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim(),
  );
}

/** OpenAI allowed: explicit openai/auto mode, legacy fallback flag, or bootstrap. */
export function openAiAllowed(): boolean {
  const mode = resolveLlmProviderMode();
  if (mode === "openai" || mode === "auto") return openAiKeyAvailable();
  return (
    process.env.AGENT_LLM_ALLOW_OPENAI_FALLBACK?.trim() === "1" && openAiKeyAvailable()
  );
}
