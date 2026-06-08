import type { AgentRecord } from "../types.js";
import { checkApiBudget, recordApiSpend } from "../budget.js";
import { getActivePrompt } from "../agent-db.js";
import {
  estimateOgCostUsd,
  ogRouterChatCompletions,
  resolveOgRouterConfig,
} from "./og-compute.js";
import { openAiAllowed, resolveLlmProviderMode } from "./provider.js";

export type LlmMessage = { role: "system" | "user" | "assistant"; content: string };

export type LlmResult = {
  ok: boolean;
  text: string;
  costUsd: number;
  source: "0g" | "openai" | "fallback";
  error?: string;
};

const BRAND_BLOCKLIST =
  /\b(100x|guaranteed returns|moon\b|airdrop hunter|price target|financial advice)\b/i;

function resolveOpenAiKey(): string | undefined {
  if (!openAiAllowed()) return undefined;
  return (
    process.env.AGENT_LLM_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    undefined
  );
}

function resolveOpenAiModel(): string {
  return process.env.AGENT_LLM_MODEL?.trim() || process.env.AI_MODEL?.trim() || "gpt-4o-mini";
}

export async function resolveSystemPrompt(
  databaseUrl: string,
  agent: AgentRecord,
): Promise<string> {
  const active = await getActivePrompt(databaseUrl, agent.id);
  return active ?? agent.systemPrompt;
}

export function brandGuard(text: string): { ok: true } | { ok: false; reason: string } {
  if (BRAND_BLOCKLIST.test(text)) {
    return { ok: false, reason: "brand_guard_blocked" };
  }
  return { ok: true };
}

async function runOpenAiChat(
  messages: LlmMessage[],
): Promise<{ ok: boolean; text: string; costUsd: number; error?: string }> {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) {
    return { ok: false, text: "", costUsd: 0, error: "openai_fallback_disabled" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolveOpenAiModel(),
      messages,
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return {
      ok: false,
      text: "",
      costUsd: 0,
      error: `openai_${res.status}:${errText.slice(0, 200)}`,
    };
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
  };
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  const tokens = json.usage?.total_tokens ?? 500;
  return { ok: true, text, costUsd: (tokens / 1000) * 0.002 };
}

export async function runLlm(
  databaseUrl: string,
  agent: AgentRecord,
  messages: LlmMessage[],
  estimatedCostUsd = 0.002,
): Promise<LlmResult> {
  const budget = await checkApiBudget(databaseUrl, agent, estimatedCostUsd);
  if (!budget.ok) {
    return {
      ok: false,
      text: "",
      costUsd: 0,
      source: "fallback",
      error: budget.reason,
    };
  }

  const mode = resolveLlmProviderMode();
  const ogConfig = mode === "openai" ? null : resolveOgRouterConfig();

  if (ogConfig) {
    const og = await ogRouterChatCompletions(ogConfig, messages);
    if (og.ok) {
      const guard = brandGuard(og.text);
      if (!guard.ok) {
        return { ok: false, text: "", costUsd: 0, source: "0g", error: guard.reason };
      }
      const costUsd = estimateOgCostUsd(og.totalTokens);
      await recordApiSpend(databaseUrl, agent.id, costUsd);
      return { ok: true, text: og.text, costUsd, source: "0g" };
    }
    if (!openAiAllowed()) {
      return { ok: false, text: "", costUsd: 0, source: "0g", error: og.error };
    }
  }

  if (mode === "0g" && !ogConfig) {
    return {
      ok: false,
      text: "",
      costUsd: 0,
      source: "0g",
      error: "0g_not_configured",
    };
  }

  const openAi = await runOpenAiChat(messages);
  if (openAi.ok) {
    const guard = brandGuard(openAi.text);
    if (!guard.ok) {
      return { ok: false, text: "", costUsd: 0, source: "openai", error: guard.reason };
    }
    await recordApiSpend(databaseUrl, agent.id, openAi.costUsd);
    return { ok: true, text: openAi.text, costUsd: openAi.costUsd, source: "openai" };
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  if (mode === "auto" && !openAiAllowed()) {
    return {
      ok: true,
      text: `[rule-based fallback] ${lastUser.slice(0, 200)}`,
      costUsd: 0,
      source: "fallback",
    };
  }

  if (!ogConfig && !resolveOpenAiKey()) {
    return {
      ok: true,
      text: `[rule-based fallback] ${lastUser.slice(0, 200)}`,
      costUsd: 0,
      source: "fallback",
    };
  }

  return {
    ok: false,
    text: "",
    costUsd: 0,
    source: "fallback",
    error: openAi.error ?? "llm_unavailable",
  };
}

export async function runAgentLlm(
  databaseUrl: string,
  agent: AgentRecord,
  userPrompt: string,
): Promise<LlmResult> {
  const systemPrompt = await resolveSystemPrompt(databaseUrl, agent);
  return runLlm(databaseUrl, agent, [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
}
