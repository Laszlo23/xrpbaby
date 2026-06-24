import { z } from "zod";

import { getMerchDrop, isMerchSize, MERCH_SIZES } from "@/content/marketplace-merch";
import { resolveMerchCheckoutPrice } from "@/lib/marketplace/merch-bcc-discount";
import { resolveX402ResourceUrl } from "@/lib/x402-resource-url";
import { getX402SettlementChain } from "@/lib/x402-network";
import {
  getStripeClient,
  isStripeConfigured,
  platformOrigin,
} from "@/server/billing/stripe-config";
import {
  getMerchCatalogLive,
  getMerchOrderForBuyer,
  getMerchOrdersForWallet,
  markMerchOrderPaid,
  merchOrderX402Price,
  merchRevenueWallet,
  reserveMerchUnit,
  type MerchShippingBrief,
} from "@/server/marketplace/merch-orders";
import { serviceRevenueWallet } from "@/server/marketplace/service-orders";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { isPrivyConfigured, requirePrivyWalletMatch } from "@/server/wallet/privy-auth";
import {
  getX402Facilitator,
  handleX402Options,
  isX402Configured,
  optionalX402PayTo,
  x402CorsHeadersFor,
  x402ConfigurationError,
} from "@/server/x402-settle";
import { settlePayment } from "thirdweb/x402";

const shippingSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  line1: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  postal: z.string().min(1).max(32),
  country: z.string().min(2).max(80),
});

const checkoutSchema = z.object({
  dropSlug: z.string().min(1),
  size: z.enum(MERCH_SIZES),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  paymentRail: z.enum(["stripe", "x402"]),
  shipping: shippingSchema,
});

export function handleMerchCheckoutOptions(request: Request): Response {
  return handleX402Options(request);
}

export async function handleMerchCatalogGet(): Promise<Response> {
  const data = await getMerchCatalogLive();
  return Response.json(data);
}

export async function handleMerchOrdersGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet")?.trim();
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return Response.json({ ok: false, error: "invalid_wallet" }, { status: 400 });
  }

  const orders = await getMerchOrdersForWallet(wallet);
  return Response.json({ ok: true, orders });
}

export async function handleMerchOrderGet(request: Request, orderId: string): Promise<Response> {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet")?.trim();
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return Response.json({ ok: false, error: "invalid_wallet" }, { status: 400 });
  }

  const order = await getMerchOrderForBuyer(orderId, wallet);
  if (!order) {
    return Response.json({ ok: false, error: "order_not_found" }, { status: 404 });
  }

  return Response.json({
    ok: true,
    order: {
      id: order.id,
      dropSlug: order.dropSlug,
      dropTitle: order.drop.title,
      unitNumber: order.unitNumber,
      editionCap: order.drop.editionCap,
      size: order.size,
      status: order.status,
      priceUsd: Number(order.priceUsd),
      paymentRail: order.paymentRail,
      x402TxHash: order.x402TxHash,
      claimPath: `/merch/claim/${order.claimCode}`,
      claimedAt: order.claimedAt?.toISOString() ?? null,
    },
  });
}

export async function handleMerchCheckoutPost(request: Request): Promise<Response> {
  const cors = x402CorsHeadersFor(request);
  const limited = checkRateLimit(request, "merch-checkout", 15);
  if (!limited.ok) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429, headers: cors });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400, headers: cors });
  }

  const drop = getMerchDrop(parsed.data.dropSlug);
  if (!drop) {
    return Response.json({ ok: false, error: "unknown_drop" }, { status: 400, headers: cors });
  }
  if (!isMerchSize(parsed.data.size)) {
    return Response.json({ ok: false, error: "invalid_size" }, { status: 400, headers: cors });
  }

  if (isPrivyConfigured()) {
    const auth = await requirePrivyWalletMatch(
      request.headers.get("authorization"),
      parsed.data.walletAddress,
    );
    if ("error" in auth) {
      return Response.json(
        { ok: false, error: auth.error },
        { status: auth.status, headers: cors },
      );
    }
  }

  const catalog = await getMerchCatalogLive();
  const liveDrop = catalog.drops.find((d) => d.slug === parsed.data.dropSlug);
  const basePrice = liveDrop?.quote?.priceUsd ?? 0;
  if (!basePrice) {
    return Response.json({ ok: false, error: "sold_out" }, { status: 409, headers: cors });
  }

  const pricing = await resolveMerchCheckoutPrice(parsed.data.walletAddress, basePrice);

  const reserved = await reserveMerchUnit({
    dropSlug: parsed.data.dropSlug,
    size: parsed.data.size,
    wallet: parsed.data.walletAddress,
    shipping: parsed.data.shipping as MerchShippingBrief,
    paymentRail: parsed.data.paymentRail,
    priceUsd: pricing.priceUsd,
  });

  if (!reserved.ok) {
    const status = reserved.error === "sold_out" ? 409 : 503;
    return Response.json({ ok: false, error: reserved.error }, { status, headers: cors });
  }

  const { order, priceUsd, dropTitle } = reserved;

  if (parsed.data.paymentRail === "stripe") {
    if (!isStripeConfigured()) {
      return Response.json(
        { ok: false, error: "stripe_not_configured" },
        { status: 503, headers: cors },
      );
    }

    const stripe = getStripeClient();
    const origin = platformOrigin();
    const shipping = parsed.data.shipping;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: shipping.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(priceUsd * 100),
            product_data: {
              name: `${dropTitle} — #${order.unitNumber}`,
              description: `Size ${order.size} · Building Culture limited merch`,
              images: [reserved.imageUrl],
            },
          },
        },
      ],
      metadata: {
        type: "merch",
        orderId: order.id,
        dropSlug: order.dropSlug,
        wallet: order.wallet,
        unitNumber: String(order.unitNumber),
      },
      success_url: `${origin}/marketplace/merch/${order.dropSlug}?checkout=success&order=${order.id}`,
      cancel_url: `${origin}/marketplace/merch/${order.dropSlug}?checkout=cancel`,
    });

    if (!session.url) {
      return Response.json({ ok: false, error: "no_checkout_url" }, { status: 500, headers: cors });
    }

    const { getPrisma } = await import("@/server/db/prisma");
    const prisma = getPrisma();
    if (prisma) {
      await prisma.merchOrder.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });
    }

    return Response.json(
      {
        ok: true,
        orderId: order.id,
        unitNumber: order.unitNumber,
        priceUsd,
        basePriceUsd: basePrice,
        discountBps: pricing.discountBps,
        paymentRail: "stripe",
        url: session.url,
        sessionId: session.id,
        claimPath: `/merch/claim/${order.claimCode}`,
      },
      { headers: cors },
    );
  }

  if (!isX402Configured()) {
    return Response.json(
      { ok: false, error: "x402_not_configured", detail: x402ConfigurationError() },
      { status: 503, headers: cors },
    );
  }

  const payPath = `/api/marketplace/merch/pay?orderId=${encodeURIComponent(order.id)}&wallet=${encodeURIComponent(parsed.data.walletAddress)}`;

  return Response.json(
    {
      ok: true,
      orderId: order.id,
      unitNumber: order.unitNumber,
      priceUsd,
      basePriceUsd: basePrice,
      discountBps: pricing.discountBps,
      paymentRail: "x402",
      price: merchOrderX402Price(order),
      payPath,
      payUrl: payPath,
      drop: { slug: drop.slug, title: dropTitle },
      claimPath: `/merch/claim/${order.claimCode}`,
    },
    { headers: cors },
  );
}

export async function handleMerchPayGet(request: Request): Promise<Response> {
  const cors = x402CorsHeadersFor(request);
  const limited = checkRateLimit(request, "merch-pay", 20);
  if (!limited.ok) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429, headers: cors });
  }

  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId")?.trim();
  const wallet = url.searchParams.get("wallet")?.trim();

  if (!orderId) {
    return Response.json({ ok: false, error: "missing_order_id" }, { status: 400, headers: cors });
  }
  if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return Response.json({ ok: false, error: "invalid_wallet" }, { status: 400, headers: cors });
  }

  if (!isX402Configured()) {
    return Response.json(
      { ok: false, error: "x402_not_configured", detail: x402ConfigurationError() },
      { status: 503, headers: cors },
    );
  }

  const order = await getMerchOrderForBuyer(orderId, wallet);
  if (!order) {
    return Response.json({ ok: false, error: "order_not_found" }, { status: 404, headers: cors });
  }

  if (order.status !== "pending_payment") {
    return Response.json(
      {
        ok: true,
        alreadyPaid: true,
        orderId: order.id,
        status: order.status,
        claimPath: `/merch/claim/${order.claimCode}`,
      },
      { headers: cors },
    );
  }

  const drop = getMerchDrop(order.dropSlug);
  const paymentData = request.headers.get("payment-signature") ?? request.headers.get("x-payment");
  const resourceUrl = resolveX402ResourceUrl(request);
  const payTo = merchRevenueWallet() ?? serviceRevenueWallet() ?? optionalX402PayTo();
  const price = merchOrderX402Price(order);

  const result = await settlePayment({
    resourceUrl,
    method: "GET",
    paymentData,
    network: getX402SettlementChain(),
    price,
    facilitator: getX402Facilitator(),
    payTo: payTo as `0x${string}` | undefined,
    routeConfig: {
      description: `${drop?.title ?? order.dropSlug} — unit #${order.unitNumber} (${price} USDC on Base)`,
      mimeType: "application/json",
    },
  });

  if (result.status === 200) {
    const paid = await markMerchOrderPaid({
      orderId,
      paymentRail: "x402",
      x402TxHash: result.paymentReceipt?.transaction,
    });

    if (!paid.ok && paid.error !== "already_paid") {
      return Response.json({ ok: false, error: paid.error }, { status: 500, headers: cors });
    }

    return Response.json(
      {
        ok: true,
        orderId,
        status: "paid",
        unitNumber: order.unitNumber,
        claimPath: `/merch/claim/${order.claimCode}`,
        x402TxHash: result.paymentReceipt?.transaction,
      },
      { headers: { ...cors, ...result.responseHeaders } },
    );
  }

  return new Response(JSON.stringify(result.responseBody), {
    status: result.status,
    headers: {
      "Content-Type": "application/json",
      ...result.responseHeaders,
      ...cors,
    },
  });
}
