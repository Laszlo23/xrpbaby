import { createFileRoute } from "@tanstack/react-router";
import { OG_AGENT_ID_DEFAULTS, OG_PROJECT_NAME, OG_PRODUCTION_PROOF_URL } from "@/lib/og-hackathon";

const METADATA = {
  name: "BUILDCHAIN Agent ID #1",
  description:
    "BUILDCHAIN Agent ID — on-chain identity layer for AI agents on 0G Chain. ERC-721 portable, user-owned identity verifiable across dApps.",
  image: "https://app.buildingcultureid.space/og-default.png",
  external_url: OG_PRODUCTION_PROOF_URL,
  attributes: [
    { trait_type: "Chain", value: "0G Chain mainnet" },
    { trait_type: "Chain ID", value: "16661" },
    { trait_type: "Contract", value: OG_AGENT_ID_DEFAULTS.contract },
    { trait_type: "Token ID", value: "1" },
    { trait_type: "Project", value: OG_PROJECT_NAME },
  ],
} as const;

export const Route = createFileRoute("/0g/agentid/1.json")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(METADATA, null, 2), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        }),
    },
  },
  component: () => null,
});
