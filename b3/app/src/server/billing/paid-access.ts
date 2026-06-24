import { formatUsdFromCents, getStripeApiSku } from "@/lib/billing/stripe-api-catalog";
import { isStripeConfigured } from "@/server/billing/stripe-config";
import {
  extractStripePurchaseId,
  validateAndConsumeStripePurchase,
} from "@/server/billing/stripe-api-purchases";
import {
  isX402Configured,
  optionalX402PayTo,
  settleX402Get,
  settleX402Post,
  x402ConfigurationError,
  x402CorsHeadersFor,
} from "@/server/x402-settle";

export type PaidAccessOptions = {
  sku: string;
  price: string;
  description: string;
  method?: "GET" | "POST" | "DELETE";
  isInternal?: (request: Request) => boolean;
  /** Optional x402 payTo override (e.g. Limx agent wallet). */
  payTo?: `0x${string}`;
  /** When set, Stripe purchase wallet must match. */
  wallet?: string;
};

function paymentRequiredResponse(request: Request, opts: PaidAccessOptions): Response {
  const cors = x402CorsHeadersFor(request);
  const skuEntry = getStripeApiSku(opts.sku);
  return Response.json(
    {
      error: "payment_required",
      x402: true,
      sku: opts.sku,
      price: opts.price,
      stripeCheckoutPath: "/api/billing/stripe/checkout",
      stripeConfigured: isStripeConfigured(),
      x402Configured: isX402Configured(),
      label: skuEntry?.label,
      apiPath: skuEntry?.apiPath,
      stripePriceUsd: skuEntry ? formatUsdFromCents(skuEntry.usdCents) : undefined,
      hint: "Pay via x402 header or buy with card at stripeCheckoutPath, then pass stripe_purchase_id on the next request.",
    },
    { status: 402, headers: cors },
  );
}

async function tryStripeAccess(
  request: Request,
  opts: PaidAccessOptions,
  buildBody: () => Promise<object>,
): Promise<Response | null> {
  const purchaseId = extractStripePurchaseId(request);
  if (!purchaseId) return null;

  const validated = await validateAndConsumeStripePurchase({
    purchaseId,
    sku: opts.sku,
    wallet: opts.wallet,
  });

  const cors = x402CorsHeadersFor(request);
  if (!validated.ok) {
    return Response.json(
      { ok: false, error: validated.error, stripePurchaseId: purchaseId },
      { status: 402, headers: cors },
    );
  }

  try {
    const body = await buildBody();
    return Response.json(body, {
      headers: {
        ...cors,
        "x-stripe-purchase-consumed": purchaseId,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed after Stripe payment";
    return Response.json({ error: message }, { status: 503, headers: cors });
  }
}

async function tryX402Access(
  request: Request,
  opts: PaidAccessOptions,
  buildBody: () => Promise<object>,
): Promise<Response | null> {
  if (!isX402Configured()) return null;

  const settleOpts = {
    price: opts.price,
    description: opts.description,
    mimeType: "application/json" as const,
    payTo: opts.payTo,
  };

  const method = opts.method ?? "GET";
  if (method === "POST" || method === "DELETE") {
    return settleX402Post(request, settleOpts, buildBody);
  }
  return settleX402Get(request, settleOpts, buildBody);
}

/**
 * Gate order: internal secret → Stripe purchase → x402 → 402 with checkout hints.
 */
export async function paidOrInternalOrStripe(
  request: Request,
  opts: PaidAccessOptions,
  buildBody: () => Promise<object>,
): Promise<Response> {
  const cors = x402CorsHeadersFor(request);

  if (opts.isInternal?.(request)) {
    try {
      return Response.json(await buildBody(), { headers: cors });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed";
      return Response.json({ error: message }, { status: 503, headers: cors });
    }
  }

  const stripeResponse = await tryStripeAccess(request, opts, buildBody);
  if (stripeResponse) return stripeResponse;

  const hasPaymentHeader =
    request.headers.has("payment-signature") || request.headers.has("x-payment");

  if (hasPaymentHeader || isX402Configured()) {
    try {
      const x402Response = await tryX402Access(request, opts, buildBody);
      if (x402Response) return x402Response;
    } catch (e) {
      const message = e instanceof Error ? e.message : "x402 settlement failed";
      return Response.json(
        { error: message, detail: x402ConfigurationError() },
        {
          status: 503,
          headers: cors,
        },
      );
    }
  }

  if (isStripeConfigured() && !hasPaymentHeader) {
    return paymentRequiredResponse(request, opts);
  }

  return paymentRequiredResponse(request, opts);
}

/** Re-export for Limx custom payTo x402 path when needed outside the shared gate. */
export { optionalX402PayTo };
