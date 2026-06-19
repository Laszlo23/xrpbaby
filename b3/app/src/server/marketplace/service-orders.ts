import {
  getMarketplaceService,
  serviceKickoffX402Price,
  type MarketplaceServiceSku,
  type ServiceBrief,
} from "@/content/marketplace-services";
import { getPrisma } from "@/server/db/prisma";
import { recordCultureMemoryEvent } from "@/server/memory/timeline";

export type { ServiceBrief };

export function serviceRevenueWallet(): string | undefined {
  const w = process.env.SERVICE_REVENUE_WALLET?.trim();
  if (w && /^0x[a-fA-F0-9]{40}$/.test(w)) return w.toLowerCase();
  return process.env.X402_PAY_TO?.trim()?.toLowerCase();
}

export async function createPendingServiceOrder(input: {
  slug: string;
  wallet: string;
  brief: ServiceBrief;
}) {
  const sku = getMarketplaceService(input.slug);
  if (!sku) return { ok: false as const, error: "unknown_sku" };

  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const wallet = input.wallet.toLowerCase();
  const order = await prisma.serviceOrder.create({
    data: {
      slug: sku.slug,
      wallet,
      status: "pending_payment",
      brief: input.brief,
      amountUsdc: String(sku.kickoffUsdc),
    },
  });

  return {
    ok: true as const,
    orderId: order.id,
    price: serviceKickoffX402Price(sku),
    kickoffUsdc: sku.kickoffUsdc,
    sku,
  };
}

export async function getServiceOrderForBuyer(orderId: string, wallet?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const order = await prisma.serviceOrder.findUnique({
    where: { id: orderId },
    include: { milestones: { orderBy: { index: "asc" } } },
  });
  if (!order) return null;
  if (wallet && order.wallet !== wallet.toLowerCase()) return null;
  return order;
}

export async function markServiceOrderPaid(orderId: string, x402TxHash?: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "order_not_found" };
  if (order.status !== "pending_payment") {
    return { ok: false as const, error: "already_paid", order };
  }

  const updated = await prisma.serviceOrder.update({
    where: { id: orderId },
    data: {
      status: "intake",
      x402TxHash: x402TxHash ?? null,
    },
  });

  return { ok: true as const, order: updated };
}

function inboxAgentKindForSku(sku: MarketplaceServiceSku): string {
  if (sku.slug === "svc-replay-guy") return "replay";
  if (sku.slug === "svc-farcaster-777") return "grove";
  return "research";
}

function fulfillmentPlanBody(sku: MarketplaceServiceSku, brief: ServiceBrief): string {
  const lines = [
    `Service order received: **${sku.title}**`,
    "",
    "Delivery squad queued:",
    ...sku.agentSquad.map((r) => `- ${r}`),
    "",
    "Milestones:",
    ...sku.milestones.map((m) => `${m.index + 1}. ${m.title} — ${m.description}`),
    "",
    "Your brief:",
    ...Object.entries(brief).map(([k, v]) => `**${k}**: ${v}`),
    "",
    "Human approval is required before any outbound posts or deploys.",
  ];
  return lines.join("\n");
}

export async function fulfillServiceOrderAfterPayment(orderId: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const order = await prisma.serviceOrder.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "order_not_found" };

  const sku = getMarketplaceService(order.slug);
  if (!sku) return { ok: false as const, error: "unknown_sku" };

  const brief = (order.brief ?? {}) as ServiceBrief;
  const agentKind = inboxAgentKindForSku(sku);
  const subject = `${sku.title} — order ${orderId.slice(0, 8)}`;

  const thread = await prisma.agentInboxThread.create({
    data: {
      walletAddress: order.wallet,
      subject,
      agentKind,
      status: "draft",
      messages: {
        create: [
          {
            role: "user",
            body: Object.entries(brief)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n\n"),
          },
          {
            role: "agent",
            body: fulfillmentPlanBody(sku, brief),
            draftJson: { orderId, slug: sku.slug, agentKind },
          },
        ],
      },
    },
  });

  await prisma.serviceMilestone.createMany({
    data: sku.milestones.map((m) => ({
      orderId,
      index: m.index,
      title: m.title,
      status: m.index === 0 ? "in_progress" : "pending",
    })),
  });

  const task = await prisma.agentTask.create({
    data: {
      type: "fulfill_service_order",
      payload: {
        orderId,
        slug: sku.slug,
        wallet: order.wallet,
        threadId: thread.id,
      },
      priority: 5,
      createdBy: "marketplace-services",
      assignedAgentId: "ceo-orchestrator-0",
    },
  });

  await prisma.serviceOrder.update({
    where: { id: orderId },
    data: {
      status: "in_progress",
      threadId: thread.id,
    },
  });

  await recordCultureMemoryEvent({
    wallet: order.wallet,
    type: "service_order_paid",
    agentRef: sku.slug,
    txHash: order.x402TxHash ?? undefined,
    payload: { orderId, amountUsdc: order.amountUsdc, taskId: task.id },
  });

  return { ok: true as const, orderId, threadId: thread.id, taskId: task.id };
}

export async function approveServiceMilestone(milestoneId: string, wallet: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const milestone = await prisma.serviceMilestone.findUnique({
    where: { id: milestoneId },
    include: { order: true },
  });
  if (!milestone) return { ok: false as const, error: "milestone_not_found" };
  if (milestone.order.wallet !== wallet.toLowerCase()) {
    return { ok: false as const, error: "forbidden" };
  }

  await prisma.serviceMilestone.update({
    where: { id: milestoneId },
    data: { status: "done" },
  });

  const pending = await prisma.serviceMilestone.count({
    where: { orderId: milestone.orderId, status: { not: "done" } },
  });

  if (pending === 0) {
    await prisma.serviceOrder.update({
      where: { id: milestone.orderId },
      data: { status: "complete" },
    });
  } else {
    const next = await prisma.serviceMilestone.findFirst({
      where: { orderId: milestone.orderId, status: "pending" },
      orderBy: { index: "asc" },
    });
    if (next) {
      await prisma.serviceMilestone.update({
        where: { id: next.id },
        data: { status: "in_progress" },
      });
      await prisma.agentTask.create({
        data: {
          type: "service_milestone_review",
          payload: {
            orderId: milestone.orderId,
            milestoneId: next.id,
            index: next.index,
          },
          priority: 3,
          createdBy: "marketplace-services",
          assignedAgentId: "ceo-orchestrator-0",
        },
      });
    }
  }

  await recordCultureMemoryEvent({
    wallet: milestone.order.wallet,
    type: "service_milestone_approved",
    payload: { milestoneId, orderId: milestone.orderId, title: milestone.title },
  });

  return {
    ok: true as const,
    milestoneId,
    orderStatus: pending === 0 ? "complete" : "in_progress",
  };
}

export async function serviceOrdersDashboard() {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      ok: true,
      orders: [],
      totals: { count: 0, usdcCollected: 0, inFlight: 0, estMarginUsd: 0, reinvestPoolUsd: 0 },
    };
  }

  const orders = await prisma.serviceOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { milestones: { orderBy: { index: "asc" } } },
  });

  const paid = orders.filter((o) => o.status !== "pending_payment");
  const usdcCollected = paid.reduce((sum, o) => sum + Number(o.amountUsdc), 0);
  const inFlight = orders.filter((o) => o.status === "in_progress" || o.status === "intake").length;

  let estMarginUsd = 0;
  let reinvestPoolUsd = 0;
  for (const o of paid) {
    const sku = getMarketplaceService(o.slug);
    if (!sku) continue;
    const labor = sku.margin.humanReviewHours * sku.margin.humanReviewRateUsd;
    const cogs = sku.margin.apiInfraUsd + labor;
    reinvestPoolUsd += (Number(o.amountUsdc) * sku.margin.reinvestPercent) / 100;
    estMarginUsd +=
      Number(o.amountUsdc) - cogs - (Number(o.amountUsdc) * sku.margin.reinvestPercent) / 100;
  }

  return {
    ok: true,
    orders: orders.map((o) => ({
      id: o.id,
      slug: o.slug,
      wallet: o.wallet,
      status: o.status,
      amountUsdc: o.amountUsdc,
      x402TxHash: o.x402TxHash,
      createdAt: o.createdAt.toISOString(),
      milestones: o.milestones.map((m) => ({
        id: m.id,
        index: m.index,
        title: m.title,
        status: m.status,
      })),
    })),
    totals: {
      count: paid.length,
      usdcCollected,
      inFlight,
      estMarginUsd: Math.round(estMarginUsd * 100) / 100,
      reinvestPoolUsd: Math.round(reinvestPoolUsd * 100) / 100,
    },
  };
}
