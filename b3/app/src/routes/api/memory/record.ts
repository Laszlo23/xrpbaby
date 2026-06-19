import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { recordCultureMemoryEvent } from "@/server/memory/timeline";

const postSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  type: z.string().min(1).max(64),
  questId: z.string().optional(),
  payload: z.unknown().optional(),
  agentRef: z.string().optional(),
  txHash: z.string().optional(),
});

export const Route = createFileRoute("/api/memory/record")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = postSchema.safeParse(body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        await recordCultureMemoryEvent({
          wallet: parsed.data.wallet.toLowerCase(),
          type: parsed.data.type,
          questId: parsed.data.questId,
          payload: parsed.data.payload,
          agentRef: parsed.data.agentRef,
          txHash: parsed.data.txHash,
        });

        return json({ ok: true });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
