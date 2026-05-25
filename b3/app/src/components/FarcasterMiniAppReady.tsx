import { useEffect } from "react";

/**
 * Signals host clients (Warpcast mini app) that the UI is ready.
 * @see https://miniapps.farcaster.xyz/docs/sdk/actions/ready
 */
export function FarcasterMiniAppReady() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const sdk = (await import("@farcaster/miniapp-sdk")).default;
        if (!cancelled && sdk?.actions?.ready) {
          await sdk.actions.ready();
        }
      } catch {
        /* Not inside a mini-app host — ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
