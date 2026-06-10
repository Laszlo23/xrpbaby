import { createFileRoute } from "@tanstack/react-router";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { BCC_ROOTS_STAKING_ABI } from "@/lib/roots-abi";
import { ROOTS_POOLS } from "@/lib/roots-config";

export const Route = createFileRoute("/api/roots/stats")({
  server: {
    handlers: {
      GET: async () => {
        const staking = process.env.VITE_BCC_ROOTS_STAKING_ADDRESS?.trim() ||
          process.env.BCC_ROOTS_STAKING_ADDRESS?.trim();
        if (!staking || !/^0x[a-fA-F0-9]{40}$/.test(staking)) {
          return json({
            ok: true,
            configured: false,
            pools: ROOTS_POOLS.map((p) => ({
              id: p.id,
              name: p.name,
              rawStakedWei: "0",
              weightedStakedWei: "0",
            })),
          });
        }

        const rpc =
          process.env.BCC_TREASURY_RPC_URL?.trim() ||
          process.env.BASE_RPC_URL?.trim() ||
          "https://mainnet.base.org";

        const client = createPublicClient({ chain: base, transport: http(rpc) });

        const pools = [];
        for (const pool of ROOTS_POOLS) {
          try {
            const [raw, weighted] = await client.readContract({
              address: staking as `0x${string}`,
              abi: BCC_ROOTS_STAKING_ABI,
              functionName: "totalStaked",
              args: [BigInt(pool.id)],
            });
            pools.push({
              id: pool.id,
              name: pool.name,
              rawStakedWei: raw.toString(),
              weightedStakedWei: weighted.toString(),
            });
          } catch {
            pools.push({
              id: pool.id,
              name: pool.name,
              rawStakedWei: "0",
              weightedStakedWei: "0",
            });
          }
        }

        return json({
          ok: true,
          configured: true,
          stakingAddress: staking,
          pools,
        });
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
