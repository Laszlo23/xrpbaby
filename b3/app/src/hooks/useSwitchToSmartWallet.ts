import { useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useCallback } from "react";

import { writePersistedActiveWallet } from "@/lib/wallet-session-storage";
import { findEmbeddedSmartWallet } from "@/lib/wallet-session-utils";

/** Activate the Privy embedded smart wallet as the active signer. */
export function useSwitchToSmartWallet() {
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();

  return useCallback(async (): Promise<boolean> => {
    const embedded = findEmbeddedSmartWallet(wallets);
    if (!embedded?.address) return false;
    await setActiveWallet(embedded);
    writePersistedActiveWallet(embedded.address);
    return true;
  }, [wallets, setActiveWallet]);
}
