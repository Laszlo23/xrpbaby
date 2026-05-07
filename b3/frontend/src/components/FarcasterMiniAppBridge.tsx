import { useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";

/** Signals host readiness when embedded as a Farcaster Mini App (no-op otherwise). */
export function FarcasterMiniAppBridge() {
  useEffect(() => {
    void sdk.actions.ready().catch(() => undefined);
  }, []);
  return null;
}
