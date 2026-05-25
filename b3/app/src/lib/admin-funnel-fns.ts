import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicClient, http, type Address } from "viem";
import { base } from "viem/chains";
import { raffleCampaignAbi, resolveRaffleCampaignAddress } from "@bc/contracts-sdk";
import { fetchPosthogFunnelCounts24h } from "@/server/posthog-funnel";

const input = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

/**
 * Returns PostHog event counts for the last 24h if caller is on-chain raffle owner.
 */
export const postAdminFunnelCounts = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => input.parse(raw ?? {}))
  .handler(async ({ data }) => {
    const envLike = { ...process.env } as Record<string, string | undefined>;
    const campaign = resolveRaffleCampaignAddress(8453, envLike);
    if (!campaign) {
      return { ok: false as const, reason: "no_campaign" as const };
    }

    const rpc =
      process.env.BASE_RPC_URL?.trim() ||
      process.env.VITE_BASE_RPC_URL?.trim() ||
      "https://mainnet.base.org";

    const client = createPublicClient({ chain: base, transport: http(rpc) });
    const owner = (await client.readContract({
      address: campaign as Address,
      abi: raffleCampaignAbi,
      functionName: "owner",
    })) as Address;

    if (owner.toLowerCase() !== data.wallet.toLowerCase()) {
      return { ok: false as const, reason: "forbidden" as const };
    }

    const counts = await fetchPosthogFunnelCounts24h();
    if (!counts) {
      return { ok: false as const, reason: "posthog_unconfigured" as const };
    }

    return { ok: true as const, counts };
  });
