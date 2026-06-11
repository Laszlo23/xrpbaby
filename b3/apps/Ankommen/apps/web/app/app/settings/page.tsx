"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@ankommen/api-client";
import { connectWallet, signMessage, sendBccToTreasury } from "@/lib/austria-chain";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl p-6">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const [walletBusy, setWalletBusy] = useState(false);
  const [bccBusy, setBccBusy] = useState(false);

  const { data: entitlements } = useQuery({
    queryKey: ["entitlements"],
    queryFn: () =>
      api.getEntitlements() as Promise<{ planName?: string; limits?: Record<string, number | null> }>,
  });

  const { data: identity, refetch: refetchIdentity } = useQuery({
    queryKey: ["identity"],
    queryFn: () => api.getIdentityStatus(),
  });

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success === "1") {
      setNotice("Subscription activated. Your entitlements have been updated.");
      void queryClient.invalidateQueries({ queryKey: ["entitlements"] });
      void refetchIdentity();
    } else if (canceled === "1") {
      setNotice("Checkout was canceled.");
    }
  }, [searchParams, queryClient, refetchIdentity]);

  const upgrade = async (planCode: string) => {
    try {
      const { url } = await api.createCheckout(planCode);
      if (url) window.location.href = url;
    } catch {
      alert("Stripe not configured. Set STRIPE_SECRET_KEY and plan price IDs.");
    }
  };

  const linkWallet = async () => {
    setWalletBusy(true);
    try {
      const address = await connectWallet();
      const { message, nonce } = await api.identityWalletChallenge(address);
      const signature = await signMessage(address, message);
      const result = await api.identityWalletVerify(address, signature, nonce);
      setNotice(
        result.claimTxHash
          ? `Wallet linked. Escrowed BCC claimed (tx ${result.claimTxHash.slice(0, 10)}…).`
          : "Wallet linked to AustriaID 2.0.",
      );
      await refetchIdentity();
      await queryClient.invalidateQueries({ queryKey: ["entitlements"] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Wallet link failed");
    } finally {
      setWalletBusy(false);
    }
  };

  const payWithBcc = async (planCode: string, price: number) => {
    if (!identity?.wallet) {
      alert("Link your Austria Chain wallet first.");
      return;
    }
    setBccBusy(true);
    try {
      const txHash = await sendBccToTreasury(identity.wallet.address as `0x${string}`, price);
      await api.payWithBcc(planCode, txHash);
      setNotice(`Subscription renewed with ${price} BCC.`);
      await queryClient.invalidateQueries({ queryKey: ["entitlements"] });
      await refetchIdentity();
    } catch (err) {
      alert(err instanceof Error ? err.message : "BCC payment failed");
    } finally {
      setBccBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {notice && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">{notice}</div>
      )}

      <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
        <div className="flex justify-between">
          <span>Plan</span>
          <span className="font-semibold text-primary">{entitlements?.planName ?? "Free"}</span>
        </div>
        <div className="flex justify-between">
          <span>AI messages this month</span>
          <span>
            {entitlements?.limits?.aiMessagesUsed ?? 0} / {entitlements?.limits?.aiMessages ?? 30}
          </span>
        </div>
        <button
          onClick={() => upgrade("PREMIUM")}
          className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground"
        >
          Upgrade to Premium (Stripe)
        </button>
        <button
          onClick={() => payWithBcc("PREMIUM", 100)}
          disabled={bccBusy}
          className="w-full rounded-full border py-3 font-semibold disabled:opacity-50"
        >
          {bccBusy ? "Processing BCC…" : "Renew Premium with 100 BCC"}
        </button>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
        <h2 className="text-lg font-semibold">AustriaID 2.0</h2>
        <div className="flex justify-between text-sm">
          <span>Identity tier</span>
          <span className="font-medium">{identity?.identityTier ?? "GUEST"}</span>
        </div>
        {identity?.wallet ? (
          <div className="space-y-1 text-sm">
            <div className="font-mono text-xs break-all">{identity.wallet.address}</div>
            <div className="text-muted-foreground">
              BCC balance: {identity.bccBalance ?? 0}
              {identity.escrowedBcc > 0 && ` · ${identity.escrowedBcc} BCC escrowed (claim by linking wallet)`}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Link your Austria Chain wallet to receive BCC from Stripe subscriptions.
          </p>
        )}
        <button
          onClick={linkWallet}
          disabled={walletBusy}
          className="w-full rounded-full border py-3 font-semibold disabled:opacity-50"
        >
          {walletBusy ? "Signing…" : identity?.wallet ? "Change wallet" : "Link wallet (SIWE)"}
        </button>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
        <a href="/api/auth/signin/google" className="block w-full rounded-full border py-3 text-center font-semibold">
          Sign in with Google
        </a>
        <button
          onClick={() =>
            api.exportData().then((d) => {
              const blob = new Blob([JSON.stringify(d)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "ankommen-export.json";
              a.click();
            })
          }
          className="w-full rounded-full border py-3 text-sm"
        >
          Export my data (GDPR)
        </button>
        <button
          onClick={() => {
            if (confirm("Delete account permanently?")) api.deleteAccount();
          }}
          className="w-full rounded-full border border-destructive py-3 text-sm text-destructive"
        >
          Delete account
        </button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <a href="/legal/privacy" className="block hover:underline">
          Privacy Policy
        </a>
        <a href="/legal/terms" className="block hover:underline">
          Terms
        </a>
        <a href="/legal/ai-disclaimer" className="block hover:underline">
          AI Disclaimer
        </a>
      </div>
    </div>
  );
}
