import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";

/** Links Privy user + embedded wallet to Postgres member on login. */
export function PrivyMemberSync() {
  const { authenticated, user, getAccessToken } = usePrivy();
  const address = usePrivyWalletAddress();
  const lastSync = useRef<string | null>(null);

  useEffect(() => {
    if (!authenticated || !user?.id || !address) return;
    const key = `${user.id}:${address.toLowerCase()}`;
    if (lastSync.current === key) return;
    lastSync.current = key;

    void (async () => {
      try {
        const token = await getAccessToken();
        await fetch("/api/wallet/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ walletAddress: address }),
        });
      } catch {
        lastSync.current = null;
      }
    })();
  }, [authenticated, user?.id, address, getAccessToken]);

  return null;
}
