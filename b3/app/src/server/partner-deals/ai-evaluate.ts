import { runInference, type ChatMessage } from "@/server/llm/inference";
import { getPrisma } from "@/server/db/prisma";
import { hashCanonicalJson } from "./hash";
import { getPartnerDeal } from "./create-deal";
import { proposeRulingOnChain } from "./onchain";
import {
  serviceDealMetadataSchema,
  serviceDealRulingSchema,
  type ServiceDealMetadata,
  type ServiceDealRuling,
} from "./schema";

type AiEvaluationResult = {
  payoutBps: number;
  confidence: number;
  kpiResults: ServiceDealRuling["kpiResults"];
  reasoning: string;
};

function parseAiJson(text: string): AiEvaluationResult | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const raw = JSON.parse(jsonMatch[0]) as Partial<AiEvaluationResult>;
    if (
      typeof raw.payoutBps !== "number" ||
      typeof raw.confidence !== "number" ||
      typeof raw.reasoning !== "string" ||
      !Array.isArray(raw.kpiResults)
    ) {
      return null;
    }
    return {
      payoutBps: Math.min(10_000, Math.max(0, Math.floor(raw.payoutBps))),
      confidence: Math.min(1, Math.max(0, raw.confidence)),
      kpiResults: raw.kpiResults,
      reasoning: raw.reasoning,
    };
  } catch {
    return null;
  }
}

function buildEvaluationPrompt(
  metadata: ServiceDealMetadata,
  evidencePayload: unknown,
): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are a service fulfillment evaluator for a DAO partner escrow.",
        "Compare promised deliverables/KPIs against submitted evidence.",
        "Return ONLY valid JSON with keys: payoutBps (0-10000), confidence (0-1), reasoning (string), kpiResults (array).",
        "Each kpiResults item: deliverableId, metric, target, actual, scoreBps (0-10000), met (boolean).",
        "Weight deliverables by weightBps when computing payoutBps.",
        "If evidence is missing for a deliverable, score it low.",
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify({ deal: metadata, evidence: evidencePayload }),
    },
  ];
}

function fallbackEvaluation(
  metadata: ServiceDealMetadata,
  metrics: Record<string, number | string | boolean>,
): AiEvaluationResult {
  const kpiResults: ServiceDealRuling["kpiResults"] = [];
  let weightedScore = 0;

  for (const deliverable of metadata.deliverables) {
    for (const kpi of deliverable.kpis) {
      const raw = metrics[kpi.metric];
      const actual = typeof raw === "number" ? raw : Number(raw) || 0;
      const ratio = kpi.target > 0 ? Math.min(1, actual / kpi.target) : 0;
      const scoreBps = Math.floor(ratio * 10_000);
      kpiResults.push({
        deliverableId: deliverable.id,
        metric: kpi.metric,
        target: kpi.target,
        actual,
        scoreBps,
        met: actual >= kpi.target,
      });
      weightedScore += (scoreBps * deliverable.weightBps) / 10_000;
    }
  }

  return {
    payoutBps: Math.floor(weightedScore),
    confidence: 0.5,
    kpiResults,
    reasoning: "Deterministic fallback scoring from submitted metrics (LLM unavailable).",
  };
}

export async function evaluatePartnerDeal(input: { dealId: string; submitOnChain?: boolean }) {
  const deal = await getPartnerDeal(input.dealId);
  if (!deal) return { ok: false as const, error: "deal_not_found" };
  if (!deal.onChainDealId) return { ok: false as const, error: "deal_not_funded_on_chain" };
  if (deal.evidence.length === 0) return { ok: false as const, error: "evidence_required" };

  const metadataParsed = serviceDealMetadataSchema.safeParse(deal.metadata);
  if (!metadataParsed.success) {
    return { ok: false as const, error: "invalid_stored_metadata" };
  }

  const latestEvidence = deal.evidence[0];
  const evidencePayload = latestEvidence.payload;
  const metrics =
    typeof evidencePayload === "object" &&
    evidencePayload !== null &&
    "metrics" in evidencePayload &&
    typeof (evidencePayload as { metrics: unknown }).metrics === "object"
      ? ((evidencePayload as { metrics: Record<string, number | string | boolean> }).metrics ?? {})
      : {};

  const messages = buildEvaluationPrompt(metadataParsed.data, evidencePayload);
  const inference = await runInference(messages);
  const parsed = inference.ok && inference.text ? parseAiJson(inference.text) : null;
  const evaluation = parsed ?? fallbackEvaluation(metadataParsed.data, metrics);

  const ruling: ServiceDealRuling = {
    version: 1,
    dealId: Number(deal.onChainDealId),
    dealMetadataHash: deal.metadataHash,
    payoutBps: evaluation.payoutBps,
    evaluatedAt: new Date().toISOString(),
    evaluator: "ai_oracle",
    confidence: evaluation.confidence,
    kpiResults: evaluation.kpiResults,
    reasoning: evaluation.reasoning,
  };

  const rulingValidated = serviceDealRulingSchema.safeParse(ruling);
  if (!rulingValidated.success) {
    return {
      ok: false as const,
      error: "invalid_ruling",
      details: rulingValidated.error.flatten(),
    };
  }

  const rulingHash = hashCanonicalJson(rulingValidated.data);
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  let proposeTxHash: string | undefined;
  if (input.submitOnChain !== false) {
    const onChain = await proposeRulingOnChain(
      BigInt(deal.onChainDealId),
      rulingValidated.data.payoutBps,
      rulingHash,
    );
    if (!onChain.ok) {
      return { ok: false as const, error: onChain.error, ruling: rulingValidated.data, rulingHash };
    }
    proposeTxHash = onChain.txHash;
  }

  const row = await prisma.partnerDealRuling.create({
    data: {
      dealId: deal.id,
      payoutBps: rulingValidated.data.payoutBps,
      rulingHash,
      aiConfidence: rulingValidated.data.confidence ?? null,
      councilOverride: false,
      reasoning: rulingValidated.data,
      proposeTxHash: proposeTxHash ?? null,
    },
  });

  await prisma.partnerDeal.update({
    where: { id: deal.id },
    data: { status: "ruled" },
  });

  return {
    ok: true as const,
    rulingId: row.id,
    ruling: rulingValidated.data,
    rulingHash,
    proposeTxHash,
    inferenceSource: inference.source,
  };
}
