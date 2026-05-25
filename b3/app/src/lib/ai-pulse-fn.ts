import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const aiPulseInputSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .max(14)
    .optional()
    .default([]),
  snapshot: z
    .object({
      xp: z.number().optional(),
      questsCompleted: z.number().optional(),
      questsTotal: z.number().optional(),
      bcdTutorialSeen: z.boolean().optional(),
      genesisClaimRecorded: z.boolean().optional(),
      bcdWeiBalanceApprox: z.string().max(40).optional(),
      walletHint: z.string().max(32).optional(),
    })
    .optional(),
});

export type AiPulseInput = z.infer<typeof aiPulseInputSchema>;

export type AiPulseResult = {
  reply: string;
  source: "openai" | "fallback";
};

const SYSTEM_PROMPT = `You are **Pulse Coach**, the in-app guide for BUILDCHAIN — a playful on-chain game around fair raffle tickets for real-world stays, art, and experiences.

Rules:
- Be concise (short paragraphs, bullets welcome). Energetic but not hypey.
- Explain **Building Culture Dollar (BCD)** as the app’s economic story / balance when relevant. Ticket UIs may show “≈ X BCD” using a **display conversion**; **on-chain minting today may still settle in the chain’s native gas token (e.g. ETH)** until a future contract accepts BCD — never claim BCD-only settlement if the user asks about today’s chain behaviour.
- Point users to: **drops** (home), **Mission** (/mission), **leaderboard / XP**, **profile quests**, **community profile** (Strapi-backed builder card), **experiences** page when relevant. Mention /mission when users ask how to mint or claim genesis BCD.
- If asked for investment or legal advice, refuse and remind them nothing here is financial or legal advice.
- Never invent contract addresses, guarantees of winning, or fake partnerships.

When a **player snapshot** JSON is provided, personalize suggestions (next quest, daily claim, enter drops, rank up).`;

function resolveOpenAiKey(): string | undefined {
  try {
    if (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function resolveModel(): string {
  try {
    if (typeof process !== "undefined" && process.env?.AI_MODEL) {
      return process.env.AI_MODEL;
    }
  } catch {
    /* ignore */
  }
  return "gpt-4o-mini";
}

function fallbackReply(input: AiPulseInput): string {
  const sn = input.snapshot;
  const lines = [
    "**Pulse Coach (offline mode)** — add `OPENAI_API_KEY` on the server for full AI replies.",
    "",
    "Try today:",
    "- Hit **Leaderboard** for XP — daily claim + quests on **Profile** (include /mission + BCD quests).",
    "- Browse **Active drops** on home; mint path follows the live raffle (native token settlement until BCD-invoice contracts ship).",
    "- Open **Get BCD** in the wallet row to learn the BCD loop (display rate vs on-chain settlement).",
  ];
  if (sn?.xp != null) {
    lines.push("", `You’re at **${sn.xp} XP** — keep chaining quests and drops.`);
  }
  if (sn?.walletHint) {
    lines.push(`(Wallet context: ${sn.walletHint})`);
  }
  return lines.join("\n");
}

async function openAiComplete(input: AiPulseInput): Promise<string | null> {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) return null;

  const snapshotBlock =
    input.snapshot != null
      ? `\n\n[Player snapshot JSON — use for personalization only, do not repeat verbatim]\n${JSON.stringify(input.snapshot)}`
      : "";

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT + snapshotBlock },
  ];

  for (const h of input.history ?? []) {
    messages.push({ role: h.role, content: h.content });
  }
  messages.push({ role: "user", content: input.message });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolveModel(),
      messages,
      max_tokens: 700,
      temperature: 0.65,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export const postAiPulseMessage = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => aiPulseInputSchema.parse(raw))
  .handler(async ({ data }): Promise<AiPulseResult> => {
    try {
      const ai = await openAiComplete(data);
      if (ai) {
        return { reply: ai, source: "openai" };
      }
    } catch {
      /* fall through to fallback */
    }
    return { reply: fallbackReply(data), source: "fallback" };
  });
