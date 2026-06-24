import sdk from "@farcaster/miniapp-sdk";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import type { Connector } from "@wagmi/core";
import type { Config } from "wagmi";

export const FARCASTER_CONNECTOR_ID = "farcaster";

export async function detectFarcasterMiniApp(): Promise<boolean> {
  try {
    return await sdk.isInMiniApp();
  } catch {
    return false;
  }
}

/** Register the Farcaster Mini App connector on the active wagmi config (Privy strips static connectors). */
export function ensureFarcasterConnector(config: Config): Connector {
  const existing = config.connectors.find(
    (c) => c.id === FARCASTER_CONNECTOR_ID || c.type === "farcasterMiniApp",
  );
  if (existing) return existing;

  const created = config._internal.connectors.setup(farcasterMiniApp());
  config._internal.connectors.setState((prev) =>
    prev.some((c) => c.id === created.id) ? prev : [...prev, created],
  );
  return created;
}
