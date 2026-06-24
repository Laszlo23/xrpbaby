import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

import {
  clearPersistedActiveWallet,
  readPersistedActiveWallet,
  writePersistedActiveWallet,
} from "@/lib/wallet-session-storage";
import { findEmbeddedSmartWallet, findWalletByAddress } from "@/lib/wallet-session-utils";

/** Keeps wagmi in sync with Privy embedded / linked wallets after login. */
export function PrivyWagmiSync() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { address: wagmiAddress } = useAccount();
  const { setActiveWallet } = useSetActiveWallet();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    if (!authenticated) {
      synced.current = null;
      clearPersistedActiveWallet();
      return;
    }

    const withAddress = wallets.filter((w) => w.address);
    if (withAddress.length === 0) return;

    const persisted = readPersistedActiveWallet();
    const fromWagmi = wagmiAddress
      ? findWalletByAddress(withAddress, wagmiAddress)
      : undefined;
    const fromPersisted = persisted ? findWalletByAddress(withAddress, persisted) : undefined;
    const embedded = findEmbeddedSmartWallet(withAddress);
    const primary = fromWagmi ?? fromPersisted ?? embedded ?? withAddress[0];

    if (!primary?.address) return;

    const key = primary.address.toLowerCase();
    if (synced.current === key) return;

    synced.current = key;
    writePersistedActiveWallet(key);
    void setActiveWallet(primary).catch(() => {
      synced.current = null;
    });
  }, [authenticated, wallets, wagmiAddress, setActiveWallet]);

  return null;
}
