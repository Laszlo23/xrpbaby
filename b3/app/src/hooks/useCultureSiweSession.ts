"use client";

import { useCallback, useState } from "react";
import { useAccount, useChainId, useSignMessage } from "wagmi";

import { buildPlatformSiweMessage } from "@/lib/platform-siwe";

export type CultureSiweSession = {
  address: string;
  message: string;
  signature: string;
};

export function useCultureSiweSession() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: signing } = useSignMessage();
  const [session, setSession] = useState<CultureSiweSession | null>(null);

  const ensureSession = useCallback(
    async (statement: string): Promise<CultureSiweSession> => {
      if (!address) {
        throw new Error("wallet_not_connected");
      }
      if (
        session &&
        session.address.toLowerCase() === address.toLowerCase()
      ) {
        return session;
      }
      const { prepared } = await buildPlatformSiweMessage(address, chainId, statement);
      const signature = await signMessageAsync({ message: prepared });
      const next: CultureSiweSession = { address, message: prepared, signature };
      setSession(next);
      return next;
    },
    [address, chainId, session, signMessageAsync],
  );

  const clearSession = useCallback(() => setSession(null), []);

  return { address, ensureSession, clearSession, session, signing };
}
