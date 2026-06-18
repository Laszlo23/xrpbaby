/**
 * AI explanation generator for the human-friendly explorer.
 *
 * Receives only verified `TxFacts` from the deterministic interpreter and
 * turns them into friendly prose via structured output. Explanations of
 * confirmed transactions are immutable, so they are cached forever in
 * Postgres (in-memory fallback when no DATABASE_URL).
 */
import { z } from "zod";

import {
  bindEliasStructuredOutput,
  createEliasChatModel,
  resolveEliasLlmBackend,
} from "@/server/elias/llm-client";
import type { TxFacts } from "@/server/explorer/interpret";
import { getPrisma } from "@/server/db/prisma";

export const txExplanationSchema = z.object({
  headline: z
    .string()
    .describe("One short, friendly sentence summarizing what happened (max ~90 chars)."),
  eli5: z
    .string()
    .describe(
      "Explain it like I'm five: 2-3 sentences a person with zero crypto knowledge understands. No jargon.",
    ),
  steps: z
    .array(z.string())
    .min(1)
    .max(6)
    .describe("What happened, step by step, in plain language."),
  whatThisMeansForYou: z
    .string()
    .describe("1-2 sentences: why a normal person might care about a transaction like this."),
  riskNotes: z
    .array(z.string())
    .max(4)
    .describe(
      "Plain-language safety notes derived ONLY from the provided risk flags. Empty if none.",
    ),
});

export type TxExplanationContent = z.infer<typeof txExplanationSchema>;

export type ExplainResult =
  | { ok: true; explanation: TxExplanationContent; cached: boolean; model: string | null }
  | { ok: false; error: "llm_unavailable" | "llm_failed" };

const memoryCache = new Map<string, { explanation: TxExplanationContent; model: string | null }>();

const SYSTEM_PROMPT = `You are the friendly guide of a block explorer that makes blockchain activity understandable for everyone — not just nerds.

You will receive VERIFIED FACTS about one blockchain transaction, extracted deterministically from chain data. Your job is to retell those facts in warm, simple, accurate language.

Rules:
- Use ONLY the provided facts. Never invent amounts, names, addresses, or intents.
- No jargon. Say "digital money" instead of "ERC-20", "network fee" instead of "gas", "collectible" instead of "NFT" (you may add the technical term in parentheses once).
- If an actor has a label, use it; otherwise refer to it as "a wallet" with its short address.
- Be honest about uncertainty: if the purpose is unclear, say what the data shows without guessing motives.
- Risk notes must be based only on the provided riskFlags — do not add new warnings, do not drop provided ones.
- Keep everything concise and friendly.`;

function cacheKey(facts: TxFacts): string {
  return `${facts.chainId}:${facts.hash.toLowerCase()}`;
}

async function readCache(
  facts: TxFacts,
): Promise<{ explanation: TxExplanationContent; model: string | null } | null> {
  const mem = memoryCache.get(cacheKey(facts));
  if (mem) return mem;
  const prisma = getPrisma();
  if (!prisma) return null;
  try {
    const row = await prisma.txExplanation.findUnique({
      where: { chainId_txHash: { chainId: facts.chainId, txHash: facts.hash.toLowerCase() } },
    });
    if (!row) return null;
    const parsed = txExplanationSchema.safeParse(row.explanation);
    if (!parsed.success) return null;
    return { explanation: parsed.data, model: row.model };
  } catch {
    return null;
  }
}

async function writeCache(
  facts: TxFacts,
  explanation: TxExplanationContent,
  model: string | null,
): Promise<void> {
  memoryCache.set(cacheKey(facts), { explanation, model });
  if (memoryCache.size > 500) {
    const first = memoryCache.keys().next().value;
    if (first) memoryCache.delete(first);
  }
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.txExplanation.upsert({
      where: { chainId_txHash: { chainId: facts.chainId, txHash: facts.hash.toLowerCase() } },
      create: {
        chainId: facts.chainId,
        txHash: facts.hash.toLowerCase(),
        facts: JSON.parse(JSON.stringify(facts)),
        explanation,
        model,
      },
      update: { facts: JSON.parse(JSON.stringify(facts)), explanation, model },
    });
  } catch {
    // cache write failures are non-fatal
  }
}

/** Generate (or return cached) plain-language explanation for verified tx facts. */
export async function explainTransaction(facts: TxFacts): Promise<ExplainResult> {
  // Pending txs can still change — don't cache those.
  const cacheable = facts.status !== "pending";

  if (cacheable) {
    const cached = await readCache(facts);
    if (cached)
      return { ok: true, explanation: cached.explanation, cached: true, model: cached.model };
  }

  const model = createEliasChatModel({ temperature: 0.4 });
  if (!model) return { ok: false, error: "llm_unavailable" };

  const structured = bindEliasStructuredOutput(model, txExplanationSchema);
  try {
    const explanation = await structured.invoke([
      ["system", SYSTEM_PROMPT],
      [
        "user",
        `Verified transaction facts (JSON):\n${JSON.stringify(facts, null, 2)}\n\nExplain this transaction for a non-technical person.`,
      ],
    ]);
    const backend = resolveEliasLlmBackend();
    const modelName =
      backend === "anthropic"
        ? (process.env.ANTHROPIC_MODEL?.trim() ?? "anthropic")
        : (process.env.AI_MODEL?.trim() ?? "gpt-4o-mini");
    if (cacheable) await writeCache(facts, explanation, modelName);
    return { ok: true, explanation, cached: false, model: modelName };
  } catch (e) {
    console.warn("explorer explain LLM call failed:", e instanceof Error ? e.message : e);
    return { ok: false, error: "llm_failed" };
  }
}

/** Cached explanation only (no generation) — for GET tx endpoint. */
export async function getCachedExplanation(facts: TxFacts): Promise<TxExplanationContent | null> {
  const cached = await readCache(facts);
  return cached?.explanation ?? null;
}
