import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

import { formatTouchpointsForPrompt } from "@/lib/bc-touchpoints";
import { retrieveBcCorpus } from "@/server/elias/retrieve";
import { eliasPrefsEnvelopeSchema } from "@/server/elias/prefs-envelope";
import { bindEliasStructuredOutput, createEliasChatModel } from "@/server/elias/llm-client";
import {
  ELIAS_AUTH_REPLY,
  ELIAS_NOT_FOUND_REPLY,
  ELIAS_RATE_LIMIT_REPLY,
  isLLMAuthError,
  isLLMNotFoundError,
  isLLMRateLimitError,
} from "@/server/elias/llm-errors";

const ecosystemOutSchema = z.object({
  assistantReply: z.string(),
  prefsPatch: z.record(z.unknown()).nullable(),
});

function getChatModel() {
  return createEliasChatModel({ temperature: 0.5 });
}

/** Conversational Elias layer — no Vienna itinerary schema; used by orb ecosystem mode */
export async function runEliasEcosystemReply(input: {
  userMessage: string;
  prefs: Record<string, unknown>;
}): Promise<{ assistantReply: string; prefs: Record<string, unknown> }> {
  const { contextBlock } = retrieveBcCorpus(input.userMessage, { topK: 6 });
  const touch = formatTouchpointsForPrompt();

  let envelopeNote = "";
  const envTry = eliasPrefsEnvelopeSchema.safeParse(input.prefs);
  if (envTry.success && Object.keys(envTry.data).length > 0) {
    envelopeNote = `Known guest envelope: ${JSON.stringify(envTry.data)}`;
  }

  const model = getChatModel();
  if (!model) {
    return {
      assistantReply:
        "**Elias (offline)** — add `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY` on the server (`frontend/.env`). Use `ELIAS_LLM_PROVIDER=anthropic` to prefer Claude. Restart the dev server.\n\nYou can still explore `/mission`, `/campaigns`, `/profile`, and Vienna planning at `/elias`.",
      prefs: input.prefs,
    };
  }

  const structured = bindEliasStructuredOutput(model, ecosystemOutSchema);
  const sys = new SystemMessage(`You are **Elias** — Building Culture's ecosystem operator (not a generic chatbot).

Voice: human, premium, trustworthy. Lead with *why* we exist: reviving meaningful places and culture — not selling APY.

Rules:
- Ground answers in the RETRIEVED CORPUS when present; do not invent partners, prices, or legal claims.
- Use TOUCHPOINTS list for real URLs/paths; prefer in-app paths starting with / when available.
- If the user needs structured Vienna itinerary + partner emails, tell them to open **/elias** (full concierge flow).
- Never claim you can move treasury or sign on-chain transactions.
- Keep replies concise (max ~180 words) unless the user asks for detail.
- prefsPatch: include only keys recognized for profile envelope (intentTier, favoredProperties, riskPosture, primaryCity, onboardingPhase, bcEntryIntentId), or **null** when nothing to merge.

${contextBlock ? `\n${contextBlock}\n` : ""}

TOUCHPOINTS:
${touch}

${envelopeNote ? `\n${envelopeNote}` : ""}`);

  const human = new HumanMessage(input.userMessage);
  let raw: unknown;
  try {
    raw = await structured.invoke([sys, human]);
  } catch (e) {
    if (isLLMRateLimitError(e)) {
      return { assistantReply: ELIAS_RATE_LIMIT_REPLY, prefs: input.prefs };
    }
    if (isLLMAuthError(e)) {
      return { assistantReply: ELIAS_AUTH_REPLY, prefs: input.prefs };
    }
    if (isLLMNotFoundError(e)) {
      return { assistantReply: ELIAS_NOT_FOUND_REPLY, prefs: input.prefs };
    }
    throw e;
  }
  let out: z.infer<typeof ecosystemOutSchema>;
  try {
    out = ecosystemOutSchema.parse(raw);
  } catch {
    return {
      assistantReply:
        "**Elias** — couldn’t parse the model response. Try a shorter question or retry in a moment.",
      prefs: input.prefs,
    };
  }
  const prefsPatch =
    out.prefsPatch !== null && out.prefsPatch !== undefined && typeof out.prefsPatch === "object"
      ? out.prefsPatch
      : {};
  const merged = { ...input.prefs, ...prefsPatch };

  return { assistantReply: out.assistantReply, prefs: merged };
}
