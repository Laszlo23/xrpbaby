import type { GroveBrief } from "./brief";
import { runInference } from "@/server/llm/inference";

const BLOCKED = /\b(airdrop|moon\b|alpha\b|guaranteed returns|100x|web3\b|defi\b)/i;

export type GroveCopy = {
  pillar: string;
  x: string;
  farcaster: string;
  telegram: string;
};

function fmtUsd(n: number | null): string | null {
  if (n == null || !Number.isFinite(n)) return null;
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 0.01) return `$${n.toFixed(2)}`;
  return `$${n.toExponential(2)}`;
}

function fmtInt(n: number | null): string | null {
  if (n == null || !Number.isFinite(n)) return null;
  return n.toLocaleString("en-US");
}

function bccContextLine(brief: GroveBrief): string {
  const price = fmtUsd(brief.bcc.priceUsd);
  const mcap = fmtUsd(brief.bcc.marketCapUsd);
  const liq = fmtUsd(brief.bcc.liquidityUsd);
  const change =
    brief.bcc.change24hPct != null && Number.isFinite(brief.bcc.change24hPct)
      ? `${brief.bcc.change24hPct > 0 ? "+" : ""}${brief.bcc.change24hPct.toFixed(2)}% 24h`
      : null;
  const parts = [`$BCC`];
  if (price) parts.push(`price ${price}`);
  if (mcap) parts.push(`mcap ${mcap}`);
  if (liq) parts.push(`liq ${liq}`);
  if (change) parts.push(change);
  return parts.join(" · ");
}

export function voiceCheck(text: string): { ok: true } | { ok: false; reason: string } {
  const t = text.trim();
  if (!t) return { ok: false, reason: "empty" };
  if (t.length > 320) return { ok: false, reason: "too_long" };
  if (BLOCKED.test(t)) return { ok: false, reason: "blocked_phrase" };
  return { ok: true };
}

export type GroveCopyPillar =
  | "forest_proof"
  | "product_path"
  | "bcc_utility"
  | "culture_story"
  | "agent_proof"
  | "attestation";

const ROTATION_PILLARS: GroveCopyPillar[] = [
  "forest_proof",
  "product_path",
  "bcc_utility",
  "culture_story",
];

/** Rotate pillars by hour so cron ticks produce varied copy. */
export function generateGroveCopy(brief: GroveBrief): GroveCopy {
  const hour = new Date().getUTCHours();
  const pillar = ROTATION_PILLARS[hour % ROTATION_PILLARS.length]!;
  return generateGroveCopyForPillar(brief, pillar);
}

/** Outcome-driven pillar: boost pillars when recent reward scores are high. */
export function selectOutcomeDrivenPillar(rewardScore7d: number | null): GroveCopyPillar {
  if (rewardScore7d != null && rewardScore7d >= 60) return "agent_proof";
  if (rewardScore7d != null && rewardScore7d >= 40) return "bcc_utility";
  const hour = new Date().getUTCHours();
  return ROTATION_PILLARS[hour % ROTATION_PILLARS.length]!;
}

export async function refineGroveCopyWithLlm(
  brief: GroveBrief,
  base: GroveCopy,
): Promise<GroveCopy> {
  const enabled =
    process.env.GROVE_LLM_ENABLED?.trim() === "1" ||
    process.env.GROVE_LLM_ENABLED?.trim()?.toLowerCase() === "true";
  if (!enabled) return base;

  const prompt = `Refine this Grove marketing copy for X (max 280 chars). Keep metrics from brief only. No airdrop/moon/alpha.
Brief pillar: ${base.pillar}
BCC context: ${bccContextLine(brief)}
X draft:
${base.x}
Respond JSON only: {"x":"...","farcaster":"...","telegram":"..."}`;

  const result = await runInference([
    {
      role: "system",
      content:
        "Proof-first marketing for Building Culture on Base. One CTA. Cite only provided metrics.",
    },
    { role: "user", content: prompt },
  ]);

  if (!result.ok || !result.text) return base;

  try {
    const parsed = JSON.parse(result.text.replace(/```json|```/g, "").trim()) as Partial<GroveCopy>;
    const x = parsed.x?.trim() ?? base.x;
    const farcaster = parsed.farcaster?.trim() ?? base.farcaster;
    const telegram = parsed.telegram?.trim() ?? base.telegram;
    const xCheck = voiceCheck(x);
    const fcCheck = voiceCheck(farcaster);
    if (!xCheck.ok || !fcCheck.ok) return base;
    return { pillar: base.pillar, x, farcaster, telegram };
  } catch {
    return base;
  }
}

export function generateGroveCopyForPillar(
  brief: GroveBrief,
  pillar: GroveCopyPillar | string,
): GroveCopy {
  switch (pillar) {
    case "product_path":
      return productPathCopy(brief);
    case "bcc_utility":
      return bccUtilityCopy(brief);
    case "culture_story":
      return cultureStoryCopy(brief);
    case "agent_proof":
      return agentProofCopy(brief);
    case "forest_proof":
    default:
      return forestProofCopy(brief);
  }
}

function forestProofCopy(brief: GroveBrief): GroveCopy {
  const liq = fmtUsd(brief.bcc.liquidityUsd);
  const vol = fmtUsd(brief.bcc.volume24hUsd);
  const members = fmtInt(brief.pulse.memberCount);
  const activity = fmtInt(brief.pulse.activity24h);

  const proofParts = [
    members ? `${members} forest members` : null,
    activity ? `${activity} activities (24h)` : null,
    liq ? `${liq} BCC pool liquidity` : null,
    vol ? `${vol} volume (24h)` : null,
  ].filter(Boolean);

  const proofLine =
    proofParts.length > 0
      ? proofParts.slice(0, 3).join(" · ")
      : "Culture Pulse records the forest daily on Base.";

  return {
    pillar: "forest_proof",
    x: [
      `${bccContextLine(brief)}`,
      "",
      `Grove 🌲 — forest update`,
      ``,
      proofLine,
      ``,
      `Verify → ${brief.links.signal}`,
    ].join("\n"),
    farcaster: [bccContextLine(brief), proofLine, `Recorded on Base · ${brief.links.signal}`].join(
      "\n",
    ),
    telegram: [
      `🌲 Grove daily update`,
      bccContextLine(brief),
      proofLine,
      `Track signal: ${brief.links.signal}`,
    ].join("\n"),
  };
}

function productPathCopy(brief: GroveBrief): GroveCopy {
  return {
    pillar: "product_path",
    x: [
      bccContextLine(brief),
      "",
      `Your .culture name on Base is about $1.11 - one pass, forest credits, community hub.`,
      ``,
      `Create your pass → ${brief.links.pass}`,
    ].join("\n"),
    farcaster: [
      bccContextLine(brief),
      `Claim your .culture pass on Base (~$1.11).`,
      `Forest credits · quests · community hub.`,
      brief.links.pass,
    ].join("\n"),
    telegram: [
      `🪪 Product path`,
      bccContextLine(brief),
      `Claim your .culture pass on Base (~$1.11).`,
      `Start here: ${brief.links.pass}`,
    ].join("\n"),
  };
}

function bccUtilityCopy(brief: GroveBrief): GroveCopy {
  return {
    pillar: "bcc_utility",
    x: [
      bccContextLine(brief),
      "",
      `Culture Coin (BCC) = community credits on Base.`,
      `Hold BCC -> 11.11% off .culture passes and art tickets.`,
      ``,
      `Join the forest → ${brief.links.join}`,
    ].join("\n"),
    farcaster: [
      bccContextLine(brief),
      `BCC = community credits (Base).`,
      `11.11% off passes and art when you pay with BCC.`,
      brief.links.join,
    ].join("\n"),
    telegram: [
      `🟢 BCC utility`,
      bccContextLine(brief),
      `Hold BCC for pass and art discounts.`,
      `Join: ${brief.links.join}`,
    ].join("\n"),
  };
}

function cultureStoryCopy(brief: GroveBrief): GroveCopy {
  return {
    pillar: "culture_story",
    x: [
      bccContextLine(brief),
      "",
      `We grow like a forest - seedling -> sapling -> tree -> grove.`,
      `Win together. Regenerate. Have fun (quests, not homework).`,
      ``,
      `${brief.links.join}`,
    ].join("\n"),
    farcaster: [
      bccContextLine(brief),
      `Building Culture grows like a forest 🌱->🌲`,
      `Community first · quests · recorded wins.`,
      brief.links.join,
    ].join("\n"),
    telegram: [
      `🌱 Culture story`,
      bccContextLine(brief),
      `Building Culture grows like a forest.`,
      `Enter the forest: ${brief.links.join}`,
    ].join("\n"),
  };
}

function agentProofCopy(brief: GroveBrief): GroveCopy {
  return {
    pillar: "agent_proof",
    x: [
      bccContextLine(brief),
      "",
      `I'm Grove - proof-first growth agent for Building Culture.`,
      `Daily digest recorded on Base · Agent ID on 0G Chain.`,
      ``,
      `Digest → ${brief.chain.digestUrl}`,
      `Agent card → ${brief.chain.agentIdUrl}`,
    ].join("\n"),
    farcaster: [
      bccContextLine(brief),
      `Grove = proof-first marketing agent.`,
      `Pulse digest on Base · BUILDCHAIN Agent ID on 0G.`,
      brief.chain.agentIdUrl,
    ].join("\n"),
    telegram: [
      `🤖 Agent proof`,
      bccContextLine(brief),
      `Grove posts proof-first updates.`,
      `Digest: ${brief.chain.digestUrl}`,
      `Agent: ${brief.chain.agentIdUrl}`,
    ].join("\n"),
  };
}

export function attestationPostCopy(brief: GroveBrief, txHash?: string | null): GroveCopy {
  const txLine = txHash ? `Tx: ${txHash.slice(0, 10)}…` : "Recorded on Base.";
  return {
    pillar: "attestation",
    x: [
      bccContextLine(brief),
      "",
      `Yesterday's forest pulse is recorded on Base.`,
      `${txLine}`,
      `Verify → ${brief.chain.digestUrl}`,
      brief.links.signal,
    ].join("\n"),
    farcaster: [
      bccContextLine(brief),
      `Forest pulse recorded on Base 🌲`,
      txLine,
      brief.chain.digestUrl,
    ].join("\n"),
    telegram: [
      `🧾 Daily attestation`,
      bccContextLine(brief),
      `Yesterday's forest pulse is recorded on Base.`,
      txLine,
      `Verify: ${brief.chain.digestUrl}`,
    ].join("\n"),
  };
}
