import { useEffect, useRef } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useAccount, useConnect, useConfig } from "wagmi";
import { base } from "@/lib/chains";
import { detectFarcasterMiniApp, ensureFarcasterConnector } from "@/lib/farcaster-miniapp";

/** Signals host readiness and auto-connects the Farcaster wallet via wagmi (no-op in browser). */
export function FarcasterMiniAppBridge() {
  const config = useConfig();
  const { connectAsync, connectors } = useConnect();
  const { isConnected } = useAccount();
  const connectAttempted = useRef(false);

  useEffect(() => {
    void sdk.actions.ready().catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const inMiniApp = await detectFarcasterMiniApp();
      if (!inMiniApp || cancelled || isConnected || connectAttempted.current) return;

      connectAttempted.current = true;
      try {
        const connector =
          connectors.find((c) => c.id === "farcaster" || c.type === "farcasterMiniApp") ??
          ensureFarcasterConnector(config);
        await connectAsync({ connector, chainId: base.id });
      } catch {
        connectAttempted.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config, connectAsync, connectors, isConnected]);

  return null;
}
