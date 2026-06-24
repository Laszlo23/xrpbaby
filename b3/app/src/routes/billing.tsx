import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Repeat, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { stripeErrorMessage } from "@/lib/billing/stripe-errors";
import { pageHead } from "@/lib/seo";

type ManifestSku = {
  sku: string;
  label: string;
  priceUsd: string;
  apiPath: string;
  method: string;
};

type StripeManifest = {
  ok: boolean;
  configured: boolean;
  checkoutPath: string;
  subscribePath?: string;
  skus: ManifestSku[];
  subscription?: {
    id: string;
    label: string;
    productId: string;
    priceLabel: string;
    culturePointsPerMonth: number;
    checkoutPath: string;
  } | null;
};

export const Route = createFileRoute("/billing")({
  head: () =>
    pageHead({
      title: "API Billing",
      description:
        "Pay per API call with card (Stripe) or USDC (x402) for BUILDCHAIN agents and trading.",
      path: "/billing",
      keywords: ["stripe", "x402", "API billing", "BUILDCHAIN"],
    }),
  component: BillingPage,
});

function BillingPage() {
  const { address, isConnected } = useAccount();
  const [manifest, setManifest] = useState<StripeManifest | null>(null);
  const [busySku, setBusySku] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [purchaseHint, setPurchaseHint] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/billing/stripe/manifest")
      .then((r) => r.json())
      .then((data: StripeManifest) => setManifest(data))
      .catch(() => setManifest(null));

    const params = new URLSearchParams(window.location.search);
    const purchaseId = params.get("stripe_purchase_id");
    const sku = params.get("sku");
    if (params.get("checkout") === "subscription_success") {
      setPurchaseHint(
        "Culture Monthly subscription active. Culture Points are credited each billing cycle.",
      );
    } else if (purchaseId && sku) {
      setPurchaseHint(
        `Payment received. Call the API with ?stripe_purchase_id=${purchaseId} (or header x-stripe-purchase-id) for SKU ${sku}.`,
      );
    }
  }, []);

  async function buySku(sku: ManifestSku) {
    if (!address || !isConnected) {
      toast.error("Connect your wallet first.");
      return;
    }
    setBusySku(sku.sku);
    try {
      const res = await fetch("/api/billing/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: sku.sku,
          walletAddress: address,
          returnPath: "/billing",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) {
        throw new Error(stripeErrorMessage(data.error));
      }
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusySku(null);
    }
  }

  async function subscribeMonthly() {
    if (!address || !isConnected) {
      toast.error("Connect your wallet first.");
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch("/api/billing/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, returnPath: "/billing" }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) {
        throw new Error(stripeErrorMessage(data.error));
      }
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Subscription checkout failed");
    } finally {
      setSubscribing(false);
    }
  }

  const featured = manifest?.skus.filter((s) =>
    [
      "buildchain_research_brief_v1",
      "limx_revenue_brief_v1",
      "buildchain_trading_quote_bcc_v1",
      "buildchain_trading_arbitrage_scan_v1",
      "xt_spot_ticker_v1",
    ].includes(s.sku),
  );

  return (
    <MarketingShell
      eyebrow="Payments"
      tone="lime"
      title="API billing"
      subtitle="One Stripe Checkout = one API call. Pay with card or keep using x402 USDC on Base."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full">
            <a href="/api/billing/stripe/manifest" target="_blank" rel="noreferrer noopener">
              Stripe manifest
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full border-white/10">
            <Link to="/wallet/packs">Culture packs</Link>
          </Button>
        </div>
      }
      articleClassName="max-w-3xl"
    >
      <div className="space-y-6">
        {purchaseHint && (
          <div className="rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4 text-sm text-lime-100">
            {purchaseHint}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
          <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-lime-400" />
            Stripe status
          </h2>
          <p className="text-sm text-zinc-400">
            {manifest?.configured
              ? "Card checkout is live for API SKUs below."
              : "Stripe is not configured on this deployment. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET on the server."}
          </p>
        </section>

        {manifest?.subscription && (
          <section className="rounded-3xl border border-lime-500/25 bg-lime-500/5 p-6 space-y-4">
            <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
              <Repeat className="h-5 w-5 text-lime-400" />
              {manifest.subscription.label}
            </h2>
            <p className="text-sm text-zinc-300">
              {manifest.subscription.priceLabel} ·{" "}
              {manifest.subscription.culturePointsPerMonth.toLocaleString()} Culture Points each
              month (same as the one-time Culture pack).
            </p>
            <p className="text-xs text-zinc-500 font-mono">
              Product {manifest.subscription.productId}
            </p>
            <button
              type="button"
              disabled={!manifest.configured || subscribing}
              onClick={() => void subscribeMonthly()}
              className="rounded-xl bg-[#C5FF41] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-50"
            >
              {subscribing ? "Redirecting…" : "Subscribe with card"}
            </button>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="font-heading text-lg text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            Featured SKUs
          </h2>
          <ul className="space-y-3">
            {(featured ?? []).map((sku) => (
              <li
                key={sku.sku}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{sku.label}</p>
                  <p className="text-xs text-zinc-500 font-mono">
                    {sku.method} {sku.apiPath}
                  </p>
                  <p className="text-sm text-lime-300 mt-1">{sku.priceUsd} / call</p>
                </div>
                <button
                  type="button"
                  disabled={!manifest?.configured || busySku !== null}
                  onClick={() => void buySku(sku)}
                  className="rounded-xl bg-[#C5FF41] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-50"
                >
                  {busySku === sku.sku ? "Redirecting…" : "Buy with card"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="text-sm text-zinc-500 space-y-2">
          <p>
            Prefer USDC on Base? Use x402 on{" "}
            <Link to="/agent-os" className="text-lime-300 underline underline-offset-2">
              Agent OS
            </Link>
            ,{" "}
            <Link to="/trading-agent" className="text-lime-300 underline underline-offset-2">
              Trading agent
            </Link>
            , or{" "}
            <Link to="/marketplace/services" className="text-lime-300 underline underline-offset-2">
              marketplace services
            </Link>
            .
          </p>
          <p>
            After checkout, pass <code className="text-zinc-300">stripe_purchase_id</code> as a
            query param or <code className="text-zinc-300">x-stripe-purchase-id</code> header on
            your next request. Entitlements expire after 24 hours if unused.
          </p>
          <p>
            See <code className="text-zinc-300">docs/STRIPE_PAYMENTS.md</code> for webhook setup and
            local Stripe CLI forwarding.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
