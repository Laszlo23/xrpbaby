import type { Runnable } from "@langchain/core/runnables";
import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import type { z } from "zod";

export type EliasLlmBackend = "openai" | "anthropic";

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

function llmMaxRetries(): number {
  return clampInt(
    Number(process.env.ELIAS_LLM_MAX_RETRIES ?? process.env.OPENAI_MAX_RETRIES ?? "") || 8,
    0,
    15,
  );
}

/** Which provider Elias will call (OpenAI default when both keys exist). */
export function resolveEliasLlmBackend(): EliasLlmBackend | null {
  const pref = process.env.ELIAS_LLM_PROVIDER?.trim().toLowerCase();
  const hasOpenai = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY?.trim());

  if (pref === "anthropic") {
    if (hasAnthropic) return "anthropic";
    if (hasOpenai) return "openai";
    return null;
  }
  if (pref === "openai") {
    if (hasOpenai) return "openai";
    if (hasAnthropic) return "anthropic";
    return null;
  }
  if (hasOpenai) return "openai";
  if (hasAnthropic) return "anthropic";
  return null;
}

export type EliasChatModel = ChatOpenAI | ChatAnthropic;

/**
 * Chat model for Elias (orb + concierge graph). Uses OpenAI or Anthropic per
 * `ELIAS_LLM_PROVIDER` / first available key.
 */
export function createEliasChatModel(fields: { temperature: number }): EliasChatModel | null {
  const backend = resolveEliasLlmBackend();
  const retries = llmMaxRetries();
  const timeoutMs = clampInt(Number(process.env.OPENAI_TIMEOUT_MS ?? "") || 120_000, 10_000, 600_000);

  if (backend === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY?.trim();
    if (!key) return null;
    const model =
      process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-haiku-20241022";
    return new ChatAnthropic({
      apiKey: key,
      model,
      temperature: fields.temperature,
      maxRetries: retries,
    });
  }

  if (backend === "openai") {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) return null;
    return new ChatOpenAI({
      apiKey: key,
      model: process.env.AI_MODEL?.trim() || "gpt-4o-mini",
      temperature: fields.temperature,
      maxRetries: retries,
      timeout: timeoutMs,
    });
  }

  return null;
}

/** Both adapters support structured output; the union breaks TS overload unify — use OpenAI-declared overload. */
export function bindEliasStructuredOutput<Schema extends z.ZodType>(
  model: EliasChatModel,
  schema: Schema,
): Runnable<BaseLanguageModelInput, z.infer<Schema>> {
  return (model as ChatOpenAI).withStructuredOutput(schema) as unknown as Runnable<
    BaseLanguageModelInput,
    z.infer<Schema>
  >;
}
