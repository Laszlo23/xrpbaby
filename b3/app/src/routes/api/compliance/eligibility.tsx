import { createFileRoute } from "@tanstack/react-router";
import { isAddress } from "viem";

import { getIdentityServerConfig } from "@/server/identity/config";

export type ComplianceEligibility = {
  ok: true;
  wallet: string;
  configured: boolean;
  /** Places ComplianceRegistry-style status when registry env is set */
  status: "unknown" | "unconfigured" | "none" | "pending" | "verified" | "revoked";
  canHoldRestrictedShares: boolean;
  chainId: number;
  complianceRegistry?: string;
  placesUrl: string;
  chainlink: {
    aceConfigured: boolean;
    porConfigured: boolean;
    matrixDoc: string;
  };
};

export const Route = createFileRoute("/api/compliance/eligibility")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet")?.trim();
        if (!wallet || !isAddress(wallet)) {
          return json({ ok: false, error: "invalid_wallet" }, 400);
        }

        const registry = process.env.COMPLIANCE_REGISTRY_ADDRESS?.trim() as `0x${string}` | undefined;
        const rpcUrl =
          process.env.VITE_BASE_RPC_URL?.trim() ||
          process.env.BASE_RPC_URL?.trim() ||
          "https://mainnet.base.org";
        const chainCfg = getIdentityServerConfig();

        let status: ComplianceEligibility["status"] = "unconfigured";
        let canHold = false;

        if (registry && registry.startsWith("0x") && registry.length === 42) {
          try {
            const { createPublicClient, http, parseAbi } = await import("viem");
            const { base } = await import("viem/chains");
            const client = createPublicClient({ chain: base, transport: http(rpcUrl) });
            const abi = parseAbi([
              "function statusOf(address) view returns (uint8)",
              "function isVerified(address) view returns (bool)",
              "function kycBypass() view returns (bool)",
            ]);
            const [statusRaw, verified, bypass] = await Promise.all([
              client.readContract({ address: registry, abi, functionName: "statusOf", args: [wallet] }),
              client.readContract({ address: registry, abi, functionName: "isVerified", args: [wallet] }),
              client.readContract({ address: registry, abi, functionName: "kycBypass", args: [] }),
            ]);
            const labels = ["none", "pending", "verified", "revoked"] as const;
            status = labels[Number(statusRaw)] ?? "unknown";
            canHold = bypass || verified;
          } catch {
            status = "unknown";
          }
        }

        const result: ComplianceEligibility = {
          ok: true,
          wallet: wallet.toLowerCase(),
          configured: !!registry,
          status,
          canHoldRestrictedShares: canHold,
          chainId: chainCfg.chainId,
          complianceRegistry: registry,
          placesUrl: process.env.PLACES_SITE_URL?.trim() || "https://buildingculture.capital",
          chainlink: {
            aceConfigured: !!process.env.CHAINLINK_ACE_COMPLIANCE_ADDRESS?.trim(),
            porConfigured: !!process.env.PROPERTY_RESERVE_FEED_ADDRESS?.trim(),
            matrixDoc: "/docs/CHAINLINK_RWA_COMPLIANCE.md",
          },
        };

        return json(result);
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=15" },
  });
}
