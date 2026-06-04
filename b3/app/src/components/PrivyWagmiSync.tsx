import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useEffect, useRef } from "react";

/** Keeps wagmi in sync with Privy embedded / linked wallets after login. */
export function PrivyWagmiSync() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    if (!authenticated) {
      synced.current = null;
      return;
    }
    const primary = wallets.find((w) => w.address);
    if (!primary?.address) return;
    const key = primary.address.toLowerCase();
    if (synced.current === key) return;
    synced.current = key;
    void setActiveWallet(primary).catch(() => {
      synced.current = null;
    });
  }, [authenticated, wallets, setActiveWallet]);

  return null;
}
