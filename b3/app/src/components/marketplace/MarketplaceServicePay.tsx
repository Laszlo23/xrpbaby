"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useFetchWithPayment } from "thirdweb/react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { thirdwebClient } from "@/lib/thirdweb-client";
import type { MarketplaceServiceSku, ServiceBrief } from "@/content/marketplace-services";

type PayResponse = {
  ok: boolean;
  orderId?: string;
  status?: string;
  threadId?: string;
  error?: string;
  alreadyPaid?: boolean;
  inboxPath?: string;
};

type CheckoutResponse = {
  ok: boolean;
  orderId?: string;
  price?: string;
  payPath?: string;
  error?: string;
};

type MarketplaceServicePayProps = {
  sku: MarketplaceServiceSku;
  brief: ServiceBrief;
  disabled?: boolean;
};

function MarketplaceServicePayInner({ sku, brief, disabled }: MarketplaceServicePayProps) {
  const { address, isConnected } = useAccount();
  const [lastError, setLastError] = useState<string | null>(null);
  const [success, setSuccess] = useState<PayResponse | null>(null);
  const priceLabel = `$${sku.kickoffUsdc.toFixed(sku.kickoffUsdc % 1 ? 2 : 0)}`;

  const client = thirdwebClient!;
  const { fetchWithPayment, isPending } = useFetchWithPayment(client, {
    maxValue: 3_000_000_000n,
    signInRequiredModal: {
      title: "Connect wallet",
      description: `Pay ${priceLabel} USDC on Base for ${sku.title}.`,
      buttonLabel: "Connect wallet",
    },
  });

  async function handlePay() {
    if (!address) return;
    setLastError(null);
    setSuccess(null);

    try {
      const checkoutRes = await fetch("/api/marketplace/services/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: sku.slug,
          walletAddress: address,
          brief,
        }),
      });
      const checkout = (await checkoutRes.json()) as CheckoutResponse;
      if (!checkout.ok || !checkout.orderId || !checkout.payPath) {
        setLastError(checkout.error ?? "Checkout failed.");
        return;
      }

      const data = (await fetchWithPayment(checkout.payPath)) as PayResponse;
      if (!data.ok) {
        setLastError(data.error ?? "Payment failed.");
        return;
      }
      setSuccess(data);
    } catch (e) {
      setLastError(e instanceof Error ? e.message : "Payment failed.");
    }
  }

  return (
    <div className="space-y-4">
      {!isConnected ? (
        <p className="text-sm text-zinc-400">
          Connect your wallet on Base to pay with USDC via x402.
        </p>
      ) : null}

      <Button
        type="button"
        className="rounded-full"
        disabled={disabled || isPending || !isConnected || !address}
        onClick={() => void handlePay()}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Paying {priceLabel} USDC…
          </>
        ) : (
          `Pay ${priceLabel} USDC — start order`
        )}
      </Button>

      <p className="text-xs text-zinc-500">
        Kickoff via x402 on Base. Human approval required before outbound actions.
        {sku.retainerPrice ? ` Retainer: ${sku.retainerPrice} (invoiced separately).` : null}
      </p>

      {lastError ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          {lastError}
        </p>
      ) : null}

      {success?.ok ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 text-sm text-emerald-100/90">
          <p className="font-medium text-emerald-50">Order confirmed</p>
          <p className="mt-2">
            Status: <span className="font-mono">{success.status ?? "in_progress"}</span>
            {success.orderId ? (
              <>
                {" "}
                · Order <span className="font-mono">{success.orderId.slice(0, 10)}…</span>
              </>
            ) : null}
          </p>
          <p className="mt-3">
            <Link
              to="/agents/inbox"
              className="text-emerald-300 underline-offset-2 hover:underline"
            >
              Open agent inbox
            </Link>{" "}
            for drafts and milestone sign-off.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function MarketplaceServicePay(props: MarketplaceServicePayProps) {
  if (!thirdwebClient) {
    return (
      <p className="text-sm text-zinc-400">
        x402 checkout requires <span className="font-mono">VITE_THIRDWEB_CLIENT_ID</span>. API
        routes remain available for agents.
      </p>
    );
  }
  return <MarketplaceServicePayInner {...props} />;
}
