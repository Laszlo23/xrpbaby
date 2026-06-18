"use client";

import { type WalletError } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useCallback, useMemo, type ReactNode } from "react";

import { getSolanaRpcUrl } from "@/lib/solana/config";

type Props = {
  children: ReactNode;
};

export function SolanaWalletProvider({ children }: Props) {
  const endpoint = useMemo(() => getSolanaRpcUrl(), []);

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: "confirmed" }}>
      <WalletProvider wallets={[]} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
