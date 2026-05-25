import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

/** FID from Warpcast mini app context when running embedded on web. */
export function useFarcasterMiniApp() {
  const [miniAppFid, setMiniAppFid] = useState<number | null>(null);
  const [inMiniApp, setInMiniApp] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    let cancelled = false;

    (async () => {
      try {
        const embedded = await sdk.isInMiniApp();
        if (cancelled) return;
        setInMiniApp(embedded);
        if (!embedded) return;
        await sdk.actions.ready();
        const ctx = await sdk.context;
        if (!cancelled && ctx?.user?.fid) {
          setMiniAppFid(ctx.user.fid);
        }
      } catch {
        if (!cancelled) {
          setInMiniApp(false);
          setMiniAppFid(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { miniAppFid, inMiniApp };
}
