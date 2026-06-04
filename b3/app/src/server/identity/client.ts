import { createPublicClient, http } from "viem";

import type { IdentityNetworkId } from "@/lib/identity/networks";
import { getIdentityServerConfig } from "@/server/identity/config";

type IdentityPublicClient = ReturnType<typeof createPublicClient>;

const cache = new Map<IdentityNetworkId, IdentityPublicClient>();

export function getIdentityPublicClient(
  networkId?: IdentityNetworkId,
): IdentityPublicClient | null {
  const cfg = getIdentityServerConfig(networkId);
  if (!cfg.configured) return null;

  let client = cache.get(cfg.networkId);
  if (!client) {
    client = createPublicClient({
      chain: cfg.chain,
      transport: http(cfg.rpcUrl),
    }) as IdentityPublicClient;
    cache.set(cfg.networkId, client);
  }
  return client;
}
