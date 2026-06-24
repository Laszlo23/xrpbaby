"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useFetchWithPayment } from "thirdweb/react";
import { CultureBaseWalletButtons } from "@bc/culture-auth/react";

import { Button } from "@/components/ui/button";
import { thirdwebClient } from "@/lib/thirdweb-client";
import {
  MERCH_SIZES,
  type MerchDropCatalogEntry,
  type MerchShippingBrief,
} from "@/content/marketplace-merch";
import { formatMerchUsd } from "@/lib/marketplace/merch-ladder";
import { merchErrorMessage } from "@/lib/marketplace/merch-errors";

const COUNTRY_OPTIONS = ["US", "CA", "GB", "DE", "FR", "AU", "MX", "BR", "OTHER"] as const;

type MerchLadderQuote = {
  unitNumber: number;
  priceUsd: number;
  nextPriceUsd: number | null;
  unitsRemaining: number;
  editionCap: number;
};

type MarketplaceMerchCheckoutProps = {
  drop: MerchDropCatalogEntry;
  quote: MerchLadderQuote | null;
  soldOut: boolean;
};

type CheckoutResponse = {
  ok: boolean;
  orderId?: string;
  priceUsd?: number;
  basePriceUsd?: number;
  discountBps?: number;
  payPath?: string;
  url?: string;
  claimPath?: string;
  error?: string;
};

type PayResponse = {
  ok: boolean;
  claimPath?: string;
  x402TxHash?: string;
  error?: string;
};

function MarketplaceMerchCheckoutInner({ drop, quote, soldOut }: MarketplaceMerchCheckoutProps) {
  const { address, isConnected } = useAccount();
  const [size, setSize] = useState<(typeof MERCH_SIZES)[number]>("M");
  const [shipping, setShipping] = useState<MerchShippingBrief>({
    name: "",
    email: "",
    line1: "",
    city: "",
    postal: "",
    country: "US",
  });
  const [lastError, setLastError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ claimPath?: string; x402TxHash?: string } | null>(null);
  const [stripePending, setStripePending] = useState(false);

  const priceLabel = quote ? formatMerchUsd(quote.priceUsd) : "—";
  const shippingComplete =
    shipping.name.trim() &&
    shipping.email.trim() &&
    shipping.line1.trim() &&
    shipping.city.trim() &&
    shipping.postal.trim() &&
    shipping.country.trim();

  const client = thirdwebClient!;
  const { fetchWithPayment, isPending: x402Pending } = useFetchWithPayment(client, {
    maxValue: 3_000_000_000n,
    signInRequiredModal: {
      title: "Connect wallet",
      description: `Pay ${priceLabel} USDC on Base for ${drop.title}.`,
      buttonLabel: "Connect wallet",
    },
  });

  async function checkoutBody(paymentRail: "stripe" | "x402") {
    if (!address) throw new Error("Connect wallet first.");
    const res = await fetch("/api/marketplace/merch/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dropSlug: drop.slug,
        size,
        walletAddress: address,
        paymentRail,
        shipping,
      }),
    });
    return (await res.json()) as CheckoutResponse;
  }

  async function handleStripe() {
    if (!address || !shippingComplete) return;
    setLastError(null);
    setSuccess(null);
    setStripePending(true);
    try {
      const checkout = await checkoutBody("stripe");
      if (!checkout.ok || !checkout.url) {
        setLastError(merchErrorMessage(checkout.error));
        return;
      }
      window.location.href = checkout.url;
    } catch (e) {
      setLastError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setStripePending(false);
    }
  }

  async function handleUsdc() {
    if (!address || !shippingComplete) return;
    setLastError(null);
    setSuccess(null);
    try {
      const checkout = await checkoutBody("x402");
      if (!checkout.ok || !checkout.payPath) {
        setLastError(merchErrorMessage(checkout.error));
        return;
      }
      const data = (await fetchWithPayment(checkout.payPath)) as PayResponse;
      if (!data.ok) {
        setLastError(merchErrorMessage(data.error));
        return;
      }
      setSuccess({ claimPath: data.claimPath ?? checkout.claimPath, x402TxHash: data.x402TxHash });
    } catch (e) {
      setLastError(e instanceof Error ? e.message : "Payment failed.");
    }
  }

  const disabled = soldOut || !quote || !shippingComplete;

  return (
    <div className="space-y-6 rounded-2xl border border-white/[0.08] bg-black/50 p-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MERCH_SIZES.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={size === s ? "secondary" : "outline"}
              className="min-w-[3rem] rounded-full font-mono"
              disabled={soldOut}
              onClick={() => setSize(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["name", "Full name", "text"],
            ["email", "Email", "email"],
            ["line1", "Address line 1", "text"],
            ["city", "City", "text"],
            ["postal", "Postal code", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block text-sm">
            <span className="text-zinc-400">{label}</span>
            <input
              type={type}
              value={shipping[key]}
              onChange={(e) => setShipping((prev) => ({ ...prev, [key]: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-zinc-100"
              disabled={soldOut}
              required
            />
          </label>
        ))}
        <label className="block text-sm">
          <span className="text-zinc-400">Country</span>
          <select
            value={
              COUNTRY_OPTIONS.includes(shipping.country as (typeof COUNTRY_OPTIONS)[number])
                ? shipping.country
                : "OTHER"
            }
            onChange={(e) => setShipping((prev) => ({ ...prev, country: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-zinc-100"
            disabled={soldOut}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {quote ? (
        <p className="text-sm text-zinc-300">
          You&apos;re buying <strong>#{quote.unitNumber}</strong> of {quote.editionCap} —{" "}
          <strong>{formatMerchUsd(quote.priceUsd)}</strong>
          {quote.nextPriceUsd != null ? (
            <> — next unit {formatMerchUsd(quote.nextPriceUsd)}</>
          ) : null}
        </p>
      ) : null}

      <p className="text-xs text-zinc-500">
        Your shirt is clothing + credential. Scan the inside label to claim on Building Culture. BCC
        holders may receive a checkout discount when configured.
      </p>

      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Connect your wallet on Base to checkout.</p>
          <CultureBaseWalletButtons mode="wagmi" />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          className="rounded-full gap-2"
          disabled={disabled || stripePending || !isConnected}
          onClick={() => void handleStripe()}
        >
          {stripePending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <CreditCard className="h-4 w-4" aria-hidden />
          )}
          Pay with card — {priceLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          disabled={disabled || x402Pending || !isConnected || !thirdwebClient}
          onClick={() => void handleUsdc()}
        >
          {x402Pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Paying USDC…
            </>
          ) : (
            `Pay with USDC — ${priceLabel}`
          )}
        </Button>
      </div>

      <p className="text-xs text-zinc-500">
        Card = Stripe hosted checkout · USDC = x402 on Base (on-chain settlement).
      </p>

      {lastError ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          {lastError}
        </p>
      ) : null}

      {success?.claimPath ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 text-sm text-emerald-100/90">
          <p className="font-medium text-emerald-50">Order confirmed</p>
          <p className="mt-2">
            Save your claim link for when the tee arrives:{" "}
            <Link
              to={success.claimPath}
              className="text-emerald-300 underline-offset-2 hover:underline"
            >
              {success.claimPath}
            </Link>
          </p>
          {success.x402TxHash ? (
            <p className="mt-2 font-mono text-xs text-emerald-200/80">
              Paid via x402 on Base · tx {success.x402TxHash.slice(0, 10)}…
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function MarketplaceMerchCheckout(props: MarketplaceMerchCheckoutProps) {
  return <MarketplaceMerchCheckoutInner {...props} />;
}
