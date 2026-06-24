import { getMarketplaceService, serviceKickoffX402Price } from "@/content/marketplace-services";
import { resolveX402ResourceUrl } from "@/lib/x402-resource-url";
import { getX402SettlementChain } from "@/lib/x402-network";
import {
  getStripeClient,
  isStripeConfigured,
  platformOrigin,
} from "@/server/billing/stripe-config";
import {
  createPendingServiceOrder,
  fulfillServiceOrderAfterPayment,
  getServiceOrderForBuyer,
  markServiceOrderPaid,
  serviceRevenueWallet,
  type ServiceBrief,
} from "@/server/marketplace/service-orders";
import {
  getX402Facilitator,
  handleX402Options,
  isX402Configured,
  optionalX402PayTo,
  x402CorsHeadersFor,
  x402ConfigurationError,
} from "@/server/x402-settle";
import { settlePayment } from "thirdweb/x402";
import { z } from "zod";

const checkoutSchema = z.object({
  slug: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  brief: z.record(z.string(), z.string()),
  paymentRail: z.enum(["stripe", "x402"]).optional().default("x402"),
});

export function handleServiceCheckoutOptions(request: Request): Response {
  return handleX402Options(request);
}

export async function handleServiceCheckoutPost(request: Request): Promise<Response> {
  const cors = x402CorsHeadersFor(request);

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid_body" }, { status: 400, headers: cors });
  }

  const sku = getMarketplaceService(parsed.data.slug);
  if (!sku) {
    return Response.json({ ok: false, error: "unknown_sku" }, { status: 400, headers: cors });
  }

  for (const field of sku.briefFields) {
    if (field.required && !parsed.data.brief[field.id]?.trim()) {
      return Response.json(
        { ok: false, error: "missing_brief_field", field: field.id },
        { status: 400, headers: cors },
      );
    }
  }

  const created = await createPendingServiceOrder({
    slug: parsed.data.slug,
    wallet: parsed.data.walletAddress,
    brief: parsed.data.brief as ServiceBrief,
  });

  if (!created.ok) {
    return Response.json({ ok: false, error: created.error }, { status: 503, headers: cors });
  }

  if (parsed.data.paymentRail === "stripe") {
    if (!isStripeConfigured()) {
      return Response.json(
        { ok: false, error: "stripe_not_configured" },
        { status: 503, headers: cors },
      );
    }

    const stripe = getStripeClient();
    const origin = platformOrigin();
    const orderId = created.orderId;
    const amountCents = Math.round(sku.kickoffUsdc * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: sku.title,
              description: `${sku.title} — marketplace service kickoff`,
            },
          },
        },
      ],
      metadata: {
        type: "service_order",
        orderId,
        slug: sku.slug,
        wallet: parsed.data.walletAddress.toLowerCase(),
      },
      success_url: `${origin}/marketplace/services/${sku.slug}?checkout=success&order=${orderId}`,
      cancel_url: `${origin}/marketplace/services/${sku.slug}?checkout=cancel`,
    });

    if (!session.url || !session.id) {
      return Response.json({ ok: false, error: "no_checkout_url" }, { status: 500, headers: cors });
    }

    const { getPrisma } = await import("@/server/db/prisma");
    const prisma = getPrisma();
    if (prisma) {
      await prisma.serviceOrder.update({
        where: { id: orderId },
        data: { stripeSessionId: session.id },
      });
    }

    return Response.json(
      {
        ok: true,
        orderId,
        price: created.price,
        kickoffUsdc: created.kickoffUsdc,
        paymentRail: "stripe",
        url: session.url,
        sessionId: session.id,
        sku: { slug: sku.slug, title: sku.title },
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

  const payPath = `/api/marketplace/services/pay?orderId=${encodeURIComponent(created.orderId)}`;

  return Response.json(
    {
      ok: true,
      orderId: created.orderId,
      price: created.price,
      kickoffUsdc: created.kickoffUsdc,
      paymentRail: "x402",
      payPath,
      payUrl: payPath,
      sku: { slug: sku.slug, title: sku.title },
    },
    { headers: cors },
  );
}

export async function handleServicePayGet(request: Request): Promise<Response> {
  const cors = x402CorsHeadersFor(request);
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId")?.trim();

  if (!orderId) {
    return Response.json({ ok: false, error: "missing_order_id" }, { status: 400, headers: cors });
  }

  if (!isX402Configured()) {
    return Response.json(
      { ok: false, error: "x402_not_configured", detail: x402ConfigurationError() },
      { status: 503, headers: cors },
    );
  }

  const order = await getServiceOrderForBuyer(orderId);
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
      },
      { headers: cors },
    );
  }

  const sku = getMarketplaceService(order.slug);
  if (!sku) {
    return Response.json({ ok: false, error: "unknown_sku" }, { status: 400, headers: cors });
  }

  const paymentData = request.headers.get("payment-signature") ?? request.headers.get("x-payment");
  const resourceUrl = resolveX402ResourceUrl(request);
  const payTo = serviceRevenueWallet() ?? optionalX402PayTo();
  const price = serviceKickoffX402Price(sku);

  const result = await settlePayment({
    resourceUrl,
    method: "GET",
    paymentData,
    network: getX402SettlementChain(),
    price,
    facilitator: getX402Facilitator(),
    payTo: payTo as `0x${string}` | undefined,
    routeConfig: {
      description: `${sku.title} — kickoff (${price} USDC on Base)`,
      mimeType: "application/json",
    },
  });

  if (result.status === 200) {
    const paid = await markServiceOrderPaid(orderId, { x402TxHash: undefined });
    if (!paid.ok && paid.error !== "already_paid") {
      return Response.json({ ok: false, error: paid.error }, { status: 500, headers: cors });
    }

    const fulfillment = await fulfillServiceOrderAfterPayment(orderId);

    return Response.json(
      {
        ok: true,
        orderId,
        status: "in_progress",
        slug: sku.slug,
        title: sku.title,
        threadId: fulfillment.ok ? fulfillment.threadId : undefined,
        taskId: fulfillment.ok ? fulfillment.taskId : undefined,
        inboxPath: "/agents/inbox",
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

export async function handleServiceOrderGet(request: Request, orderId: string): Promise<Response> {
  const cors = x402CorsHeadersFor(request);
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet")?.trim();

  const order = await getServiceOrderForBuyer(orderId, wallet ?? undefined);
  if (!order) {
    return Response.json({ ok: false, error: "order_not_found" }, { status: 404, headers: cors });
  }

  const sku = getMarketplaceService(order.slug);

  return Response.json(
    {
      ok: true,
      order: {
        id: order.id,
        slug: order.slug,
        title: sku?.title,
        status: order.status,
        amountUsdc: order.amountUsdc,
        x402TxHash: order.x402TxHash,
        stripeSessionId: order.stripeSessionId,
        threadId: order.threadId,
        createdAt: order.createdAt.toISOString(),
        milestones: order.milestones.map((m) => ({
          id: m.id,
          index: m.index,
          title: m.title,
          status: m.status,
        })),
      },
    },
    { headers: cors },
  );
}
