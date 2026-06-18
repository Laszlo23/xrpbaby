import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { agentAccessFromBccBalance, agentAccessLabel } from "@/lib/bcc-agent-access";
import { BCC_AGENT_ACCESS_MIN_WEI } from "@/lib/grant-agent-config";
import { readWalletBccBalanceWei } from "@/server/wallet/bcc-payment-verify";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/agents/access")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = querySchema.safeParse({ address: url.searchParams.get("address") });
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_address" }, 400);
        }

        const balanceWei = await readWalletBccBalanceWei(
          parsed.data.address.toLowerCase() as `0x${string}`,
        );
        const tier = agentAccessFromBccBalance(balanceWei);

        return json({
          ok: true,
          balanceWei: balanceWei.toString(),
          minAccessWei: BCC_AGENT_ACCESS_MIN_WEI.toString(),
          tier,
          label: agentAccessLabel(tier),
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=30" },
  });
}
