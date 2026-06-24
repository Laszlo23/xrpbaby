import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";

import { researchBrandGuard } from "@/lib/agent-os-catalog";
import {
  LIMX_AGENT_ID,
  LIMX_AGENT_SYSTEM_PROMPT,
  limxAgentWalletAddress,
  x402LimxPrice,
} from "@/lib/limx-agent-config";
import { paidOrInternalOrStripe } from "@/server/billing/paid-access";
import { getPrisma } from "@/server/db/prisma";
import { runInference } from "@/server/llm/inference";
import { handleX402Options, x402CorsHeadersFor } from "@/server/x402-settle";

const LIMX_SKU = "limx_revenue_brief_v1";
const MAX_QUERY_LEN = 2000;

function badRequest(message: string, request: Request): Response {
  return Response.json({ error: message }, { status: 400, headers: x402CorsHeadersFor(request) });
}

async function logLimxAction(input: {
  query: string;
  status: string;
  source?: string;
  errorMsg?: string;
  costUsd?: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.agentActionLog.create({
      data: {
        id: randomUUID(),
        agentId: LIMX_AGENT_ID,
        action: "agent.limx_opportunity_brief",
        params: {
          queryLength: input.query.length,
          source: input.source ?? null,
        } as Prisma.InputJsonValue,
        dryRun: false,
        status: input.status,
        errorMsg: input.errorMsg,
        costUsd: input.costUsd,
      },
    });
  } catch {
    /* non-fatal */
  }
}

async function runLimxBrief(
  query: string,
): Promise<
  | { ok: true; brief: string; source: "openai" | "0g" }
  | { ok: false; error: string; source?: string }
> {
  const result = await runInference([
    { role: "system", content: LIMX_AGENT_SYSTEM_PROMPT },
    { role: "user", content: query },
  ]);

  if (!result.ok || !result.text) {
    await logLimxAction({
      query,
      status: "error",
      source: result.source,
      errorMsg: result.error ?? "inference_failed",
    });
    return { ok: false, error: result.error ?? "inference_failed", source: result.source };
  }

  const guard = researchBrandGuard(result.text);
  if (!guard.ok) {
    await logLimxAction({
      query,
      status: "blocked",
      source: result.source,
      errorMsg: guard.reason,
    });
    return { ok: false, error: guard.reason, source: result.source };
  }

  await logLimxAction({
    query,
    status: "ok",
    source: result.source,
    costUsd: x402LimxPrice().replace(/^\$/, ""),
  });

  const source = result.source === "0g" ? "0g" : "openai";
  return { ok: true, brief: result.text, source };
}

export { handleX402Options as handleLimxOptions };

export async function handleLimxX402Get(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return badRequest("missing_query_param_q", request);
  }
  if (q.length > MAX_QUERY_LEN) {
    return badRequest("query_too_long", request);
  }

  const price = x402LimxPrice();

  return paidOrInternalOrStripe(
    request,
    {
      sku: LIMX_SKU,
      price,
      description:
        "Limx Revenue Agent — grants, partnerships, sponsors, and growth opportunity brief (JSON)",
      payTo: limxAgentWalletAddress(),
    },
    async () => {
      const outcome = await runLimxBrief(q);
      if (!outcome.ok) {
        return {
          ok: false as const,
          agent: "limx" as const,
          wallet: limxAgentWalletAddress(),
          query: q,
          error: outcome.error,
          source: outcome.source ?? null,
          generatedAt: new Date().toISOString(),
        };
      }
      return {
        ok: true as const,
        agent: "limx" as const,
        wallet: limxAgentWalletAddress(),
        query: q,
        brief: outcome.brief,
        source: outcome.source,
        generatedAt: new Date().toISOString(),
      };
    },
  );
}
