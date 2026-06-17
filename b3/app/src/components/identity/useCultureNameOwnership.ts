import { useAccount, useChainId, useSignMessage } from "wagmi";
import { useState } from "react";

import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import { buildPlatformSiweMessage } from "@/lib/platform-siwe";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export function useCultureNameOwnership(resolved: ResolvedCultureName) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: signing } = useSignMessage();
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const isOwner =
    verified ||
    (resolved.status === "claimed" &&
      resolved.owner &&
      address &&
      address.toLowerCase() === resolved.owner.toLowerCase());

  async function proveOwnership() {
    if (!address || !resolved.owner || resolved.status !== "claimed") return;
    setVerifying(true);
    setVerifyError("");
    try {
      const statement = `I own the Culture Layer name ${resolved.fullName} on ${BRAND_DISPLAY_NAME}.`;
      const { prepared } = await buildPlatformSiweMessage(address, chainId, statement);
      const signature = await signMessageAsync({ message: prepared });
      const res = await fetch("/api/identity/verify-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cultureName: resolved.fullName,
          address,
          message: prepared,
          signature,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setVerifyError(data.error ?? "Verification failed");
        return;
      }
      setVerified(true);
    } catch {
      setVerifyError("Sign-in cancelled or failed");
    } finally {
      setVerifying(false);
    }
  }

  return {
    isConnected,
    isOwner,
    verifyError,
    verifying: verifying || signing,
    proveOwnership,
  };
}
