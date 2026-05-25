/**
 * Dynamic ERC-8004 / A2A-style discovery payload for /.well-known/agent.json
 */
import { getServerPublicOrigin } from "@/lib/app-origin";

export type BuildchainAgentCard = {
  schema_version: string;
  name: string;
  description: string;
  kind: "a2a";
  canonical_url: string;
  capabilities: string[];
  resources: Array<{
    id: string;
    description: string;
    protocol: string;
    method: string;
    url: string;
    price_env: string;
  }>;
  deeplinks: Record<string, string>;
};

/** Public agent card JSON — safe to cache; URLs derived from PUBLIC_APP_ORIGIN / VITE_APP_ORIGIN / URL */
export function buildBuildchainAgentCard(): BuildchainAgentCard {
  const origin = getServerPublicOrigin();
  const base = origin.replace(/\/$/, "");
  const x402Url = `${base}/api/x402/premium`;

  return {
    schema_version: "1",
    name: "BUILDCHAIN",
    description:
      "Building Culture BUILDCHAIN surfaces: paid JSON feeds (x402), BCD fixed-price acquisition, NFT marketplace.",
    kind: "a2a",
    canonical_url: base,
    capabilities: [
      "x402-json-feed",
      "bcd-fixed-price-sale",
      "thirdweb-marketplace",
      "farcaster-miniapp",
    ],
    resources: [
      {
        id: "buildchain_premium_drop_teasers_v1",
        description:
          "Paid JSON feed of public drop teaser metadata (titles, rarity, timing). GET with x402 payment.",
        protocol: "x402",
        method: "GET",
        url: x402Url,
        price_env: "X402_PRICE",
      },
    ],
    deeplinks: {
      presale: `${base}/presale`,
      campaign: `${base}/campaign`,
      marketplace: `${base}/marketplace`,
      docs: `${base}/docs`,
      agent_fleet: `${base}/agent-fleet`,
    },
  };
}
