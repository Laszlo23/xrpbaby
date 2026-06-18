import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";
import type { Address, Hash } from "viem";
import { z } from "zod";

import {
  GRANT_AGENT_BCC_PRICE,
  GRANT_AGENT_BCC_PRICE_WEI,
  GRANT_AGENT_SYSTEM_PROMPT,
} from "@/lib/grant-agent-config";
import { getPrisma } from "@/server/db/prisma";
import { runInference } from "@/server/llm/inference";
import { verifyBccPaymentToTreasury } from "@/server/wallet/bcc-payment-verify";

const GRANT_AGENT_ID = "grant_agent";

const bodySchema = z.object({
  brief: z.string().min(20).max(4000),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

async function logGrantAction(input: {
  brief: string;
  status: string;
  walletAddress: string;
  errorMsg?: string;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  try {
    await prisma.agentActionLog.create({
      data: {
        id: randomUUID(),
        agentId: GRANT_AGENT_ID,
        action: "agent.grant_brief",
        params: {
          briefLength: input.brief.length,
          wallet: input.walletAddress.toLowerCase(),
        } as Prisma.InputJsonValue,
        dryRun: false,
        status: input.status,
        errorMsg: input.errorMsg,
        costUsd: String(GRANT_AGENT_BCC_PRICE),
      },
    });
  } catch {
    /* non-fatal */
  }
}

export async function handleGrantAgentPost(request: Request): Promise<Response> {
  const prisma = getPrisma();
  if (!prisma) {
    return Response.json({ ok: false, error: "no_database" }, { status: 503 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const wallet = body.walletAddress.toLowerCase() as Address;
  const txHash = body.txHash as Hash;

  const paid = await verifyBccPaymentToTreasury({
    txHash,
    expectedFrom: wallet,
    minAmountWei: GRANT_AGENT_BCC_PRICE_WEI,
  });

  if (!paid.ok) {
    await logGrantAction({
      brief: body.brief,
      status: "payment_failed",
      walletAddress: wallet,
      errorMsg: paid.error,
    });
    return Response.json(
      { ok: false, error: paid.error, priceBcc: GRANT_AGENT_BCC_PRICE },
      { status: 402 },
    );
  }

  const duplicateTx = await prisma.agentActionLog.findFirst({
    where: {
      agentId: GRANT_AGENT_ID,
      params: { path: ["txHash"], equals: txHash },
    },
  });
  if (duplicateTx) {
    return Response.json({ ok: false, error: "tx_already_used" }, { status: 409 });
  }

  const result = await runInference([
    { role: "system", content: GRANT_AGENT_SYSTEM_PROMPT },
    { role: "user", content: body.brief },
  ]);

  if (!result.ok || !result.text) {
    await logGrantAction({
      brief: body.brief,
      status: "error",
      walletAddress: wallet,
      errorMsg: result.error ?? "inference_failed",
    });
    return Response.json({ ok: false, error: result.error ?? "inference_failed" }, { status: 503 });
  }

  await logGrantAction({
    brief: body.brief,
    status: "ok",
    walletAddress: wallet,
  });

  await prisma.agentActionLog.create({
    data: {
      id: randomUUID(),
      agentId: GRANT_AGENT_ID,
      action: "agent.grant_payment",
      params: { wallet, txHash, amountWei: paid.amountWei.toString() } as Prisma.InputJsonValue,
      dryRun: false,
      status: "ok",
    },
  });

  return Response.json({
    ok: true,
    agent: "grant",
    brief: body.brief,
    report: result.text,
    priceBcc: GRANT_AGENT_BCC_PRICE,
    txHash,
    generatedAt: new Date().toISOString(),
  });
}

export function grantAgentPriceBcc(): number {
  return GRANT_AGENT_BCC_PRICE;
}
