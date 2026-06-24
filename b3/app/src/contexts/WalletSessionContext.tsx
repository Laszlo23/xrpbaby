import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useAccount } from "wagmi";

import { useCultureLogin } from "@/hooks/useCultureLogin";
import { useWalletCultureIdentity } from "@/hooks/useWalletCultureIdentity";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import {
  findEmbeddedSmartWallet,
  findWalletByAddress,
  resolveStableSessionAddress,
  resolveWalletDisplayLabel,
  resolveWasConnected,
  walletKindFromClientType,
  walletKindLabelFromClientType,
} from "@/lib/wallet-session-utils";

export type WalletSession = {
  ready: boolean;
  authenticated: boolean;
  address?: string;
  displayLabel: string;
  walletKind: "smart" | "external" | "unknown";
  walletKindLabel: string;
  isSyncing: boolean;
  wasConnected: boolean;
  embeddedWalletAddress?: string;
  canSwitchToSmartWallet: boolean;
};

const EMPTY_SESSION: WalletSession = {
  ready: false,
  authenticated: false,
  displayLabel: "…",
  walletKind: "unknown",
  walletKindLabel: "Wallet",
  isSyncing: false,
  wasConnected: false,
  canSwitchToSmartWallet: false,
};

const WalletSessionContext = createContext<WalletSession>(EMPTY_SESSION);

function PrivyWalletSessionProvider({ children }: { children: ReactNode }) {
  const { ready: privyReady, authenticated } = usePrivy();
  const { ready: loginReady } = useCultureLogin();
  const { wallets } = useWallets();
  const liveAddress = usePrivyWalletAddress();
  const { address: wagmiAddress } = useAccount();
  const { primaryName, isLoading: identityLoading } = useWalletCultureIdentity();
  const latchedRef = useRef<string | undefined>();

  useEffect(() => {
    if (liveAddress) {
      latchedRef.current = liveAddress.toLowerCase();
      return;
    }
    if (!authenticated) {
      latchedRef.current = undefined;
    }
  }, [liveAddress, authenticated]);

  const address = resolveStableSessionAddress({
    liveAddress,
    latchedAddress: latchedRef.current,
    authenticated,
  });

  const activeWallet = useMemo(
    () => findWalletByAddress(wallets, address ?? liveAddress ?? wagmiAddress),
    [wallets, address, liveAddress, wagmiAddress],
  );

  const embeddedWallet = useMemo(() => findEmbeddedSmartWallet(wallets), [wallets]);
  const embeddedAddress = embeddedWallet?.address?.toLowerCase();

  const ready = privyReady && loginReady;
  const isSyncing = authenticated && ready && !address;
  const canSwitchToSmartWallet = Boolean(
    embeddedAddress && address && embeddedAddress !== address.toLowerCase(),
  );

  const value: WalletSession = {
    ready,
    authenticated,
    address,
    displayLabel: resolveWalletDisplayLabel({ primaryName, address, identityLoading }),
    walletKind: walletKindFromClientType(activeWallet?.walletClientType),
    walletKindLabel: walletKindLabelFromClientType(activeWallet?.walletClientType),
    isSyncing,
    wasConnected: resolveWasConnected({
      authenticated,
      address,
      latchedAddress: latchedRef.current,
    }),
    embeddedWalletAddress: embeddedAddress,
    canSwitchToSmartWallet,
  };

  return <WalletSessionContext.Provider value={value}>{children}</WalletSessionContext.Provider>;
}

function LegacyWalletSessionProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { primaryName, isLoading: identityLoading } = useWalletCultureIdentity();
  const latchedRef = useRef<string | undefined>();

  useEffect(() => {
    if (address) {
      latchedRef.current = address.toLowerCase();
      return;
    }
    if (!isConnected) {
      latchedRef.current = undefined;
    }
  }, [address, isConnected]);

  const stableAddress = resolveStableSessionAddress({
    liveAddress: address,
    latchedAddress: latchedRef.current,
    authenticated: isConnected,
  });

  const value: WalletSession = {
    ready: !isConnecting,
    authenticated: isConnected,
    address: stableAddress,
    displayLabel: resolveWalletDisplayLabel({
      primaryName,
      address: stableAddress,
      identityLoading,
    }),
    walletKind: isConnected ? "external" : "unknown",
    walletKindLabel: isConnected ? "External wallet" : "Wallet",
    isSyncing: isConnecting,
    wasConnected: resolveWasConnected({
      authenticated: isConnected,
      address: stableAddress,
      latchedAddress: latchedRef.current,
    }),
    canSwitchToSmartWallet: false,
  };

  return <WalletSessionContext.Provider value={value}>{children}</WalletSessionContext.Provider>;
}

export function WalletSessionProvider({
  children,
  privyMode,
}: {
  children: ReactNode;
  privyMode: boolean;
}) {
  if (privyMode) {
    return <PrivyWalletSessionProvider>{children}</PrivyWalletSessionProvider>;
  }
  return <LegacyWalletSessionProvider>{children}</LegacyWalletSessionProvider>;
}

/** Canonical wallet session for navbar chrome and layout gates. */
export function useWalletSession(): WalletSession {
  return useContext(WalletSessionContext);
}
