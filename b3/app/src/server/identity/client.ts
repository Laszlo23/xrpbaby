import { createPublicClient, http } from "viem";

import { getIdentityServerConfig } from "@/server/identity/config";

type IdentityPublicClient = ReturnType<typeof createPublicClient>;

let cached: IdentityPublicClient | null = null;

export function getIdentityPublicClient(): IdentityPublicClient | null {
  const cfg = getIdentityServerConfig();
  if (!cfg.configured) return null;
  if (!cached) {
    cached = createPublicClient({
      chain: cfg.chain,
      transport: http(cfg.rpcUrl),
    });
  }
  return cached;
}
