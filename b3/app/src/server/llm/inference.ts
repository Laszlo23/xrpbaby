/**
 * Shared LLM inference — 0G when funded; OpenAI in bootstrap/auto mode.
 */

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type InferenceResult = {
  ok: boolean;
  text: string;
  source: "0g" | "openai" | "none";
  error?: string;
};

type LlmProviderMode = "0g" | "openai" | "auto";

function resolveLlmProviderMode(): LlmProviderMode {
  const explicit = process.env.AGENT_LLM_PROVIDER?.trim().toLowerCase();
  if (explicit === "0g" || explicit === "openai" || explicit === "auto") return explicit;
  if (process.env.AGENT_BOOTSTRAP_MODE?.trim() === "1") return "auto";
  return "0g";
}

function openAiAllowed(): boolean {
  const mode = resolveLlmProviderMode();
  const hasKey = Boolean(
    process.env.AGENT_LLM_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim(),
  );
  if (mode === "openai" || mode === "auto") return hasKey;
  return process.env.AGENT_LLM_ALLOW_OPENAI_FALLBACK?.trim() === "1" && hasKey;
}

function resolveOgConfig(): {
  baseUrl: string;
  apiKey: string;
  model: string;
} | null {
  const routerKey =
    process.env.OG_COMPUTE_ROUTER_API_KEY?.trim() ||
    process.env.ZERO_G_ROUTER_API_KEY?.trim() ||
    process.env.OG_ROUTER_API_KEY?.trim();
  const directKey = process.env.OG_COMPUTE_DIRECT_API_KEY?.trim();
  const directUrl = process.env.OG_COMPUTE_DIRECT_URL?.trim();

  const network =
    process.env.OG_COMPUTE_NETWORK?.trim().toLowerCase() === "testnet" ? "testnet" : "mainnet";

  const model =
    process.env.OG_COMPUTE_MODEL?.trim() ||
    process.env.AGENT_LLM_MODEL?.trim() ||
    "zai-org/GLM-5-FP8";

  if (routerKey) {
    const baseUrl =
      process.env.OG_COMPUTE_ROUTER_URL?.trim() ||
      (network === "testnet"
        ? "https://router-api-testnet.integratenetwork.work/v1"
        : "https://router-api.0g.ai/v1");
    return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey: routerKey, model };
  }

  if (directKey && directUrl) {
    const base = directUrl.replace(/\/chat\/completions\/?$/, "").replace(/\/$/, "");
    return { baseUrl: base, apiKey: directKey, model };
  }

  return null;
}

async function chatOg(
  config: { baseUrl: string; apiKey: string; model: string },
  messages: ChatMessage[],
): Promise<InferenceResult> {
  const url = config.baseUrl.endsWith("/chat/completions")
    ? config.baseUrl
    : `${config.baseUrl}/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.5,
      max_tokens: 800,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    return {
      ok: false,
      text: "",
      source: "0g",
      error: res.status === 402 ? "0g_insufficient_balance" : `0g_${res.status}:${err.slice(0, 120)}`,
    };
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return {
    ok: true,
    text: json.choices?.[0]?.message?.content?.trim() ?? "",
    source: "0g",
  };
}

async function chatOpenAi(messages: ChatMessage[]): Promise<InferenceResult> {
  const apiKey =
    process.env.AGENT_LLM_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { ok: false, text: "", source: "none", error: "no_llm_key" };

  const model = process.env.AGENT_LLM_MODEL?.trim() || process.env.AI_MODEL?.trim() || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature: 0.5, max_tokens: 800 }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    return { ok: false, text: "", source: "openai", error: `openai_${res.status}` };
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return {
    ok: true,
    text: json.choices?.[0]?.message?.content?.trim() ?? "",
    source: "openai",
  };
}

/** 0G when configured; OpenAI in bootstrap/auto mode when 0G unavailable. */
export async function runInference(messages: ChatMessage[]): Promise<InferenceResult> {
  const mode = resolveLlmProviderMode();
  const og = mode === "openai" ? null : resolveOgConfig();

  if (og) {
    const result = await chatOg(og, messages);
    if (result.ok) return result;
    if (!openAiAllowed()) return result;
  }

  if (mode === "0g" && !og) {
    return { ok: false, text: "", source: "none", error: "configure_OG_COMPUTE_ROUTER_API_KEY" };
  }

  if (openAiAllowed()) return chatOpenAi(messages);

  return { ok: false, text: "", source: "none", error: "no_llm_provider" };
}
