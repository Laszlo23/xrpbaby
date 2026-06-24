import { randomBytes } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import { getMerchDrop, MERCH_DROPS, type MerchShippingBrief } from "@/content/marketplace-merch";
import {
  merchEditionCap,
  merchLadderQuote,
  merchProductionTargetUsd,
  merchX402PriceLabel,
  priceUsdForUnitNumber,
} from "@/lib/marketplace/merch-ladder";
import { computeMerchRevenueSplit } from "@/lib/marketplace/merch-revenue";
import { getPrisma } from "@/server/db/prisma";
import { recordCultureMemoryEvent } from "@/server/memory/timeline";
import { serviceRevenueWallet } from "@/server/marketplace/service-orders";

export type { MerchShippingBrief };

export function merchRevenueWallet(): string | undefined {
  return serviceRevenueWallet();
}

export function merchReserveTtlMinutes(): number {
  const raw = process.env.MERCH_RESERVE_TTL_MINUTES?.trim();
  const n = raw ? Number(raw) : 30;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 30;
}

function claimCode(): string {
  return randomBytes(12).toString("base64url");
}

function activeSlotWhere(dropSlug: string, now = new Date()): Prisma.MerchOrderWhereInput {
  return {
    dropSlug,
    OR: [
      { status: { in: ["paid", "claimed"] } },
      {
        status: "pending_payment",
        OR: [{ reservedUntil: { gt: now } }, { reservedUntil: null }],
      },
    ],
  };
}

export async function countActiveMerchSlots(
  prisma: PrismaClient | Prisma.TransactionClient,
  dropSlug: string,
): Promise<number> {
  return prisma.merchOrder.count({ where: activeSlotWhere(dropSlug) });
}

export async function releaseExpiredMerchReservations(prisma: PrismaClient) {
  const now = new Date();
  const expired = await prisma.merchOrder.findMany({
    where: {
      status: "pending_payment",
      reservedUntil: { lt: now },
    },
    select: { id: true, dropSlug: true },
  });
  if (expired.length === 0) return { released: 0 };

  await prisma.merchOrder.updateMany({
    where: { id: { in: expired.map((o) => o.id) } },
    data: { status: "cancelled" },
  });

  return { released: expired.length };
}

export async function ensureMerchDrops(prisma: PrismaClient) {
  const cap = merchEditionCap();
  const target = merchProductionTargetUsd();

  for (const entry of MERCH_DROPS) {
    await prisma.merchDrop.upsert({
      where: { slug: entry.slug },
      create: {
        slug: entry.slug,
        title: entry.title,
        imageUrl: entry.imageUrl,
        editionCap: cap,
        soldCount: 0,
        productionTargetUsd: target,
        status: "open",
      },
      update: {
        title: entry.title,
        imageUrl: entry.imageUrl,
        editionCap: cap,
        productionTargetUsd: target,
      },
    });
  }
}

async function buildDropCatalogRow(
  row: {
    slug: string;
    title: string;
    imageUrl: string;
    editionCap: number;
    soldCount: number;
    status: string;
  },
  activeCount: number,
) {
  const catalog = getMerchDrop(row.slug);
  const unitsRemaining = Math.max(0, row.editionCap - activeCount);
  const nextUnit = activeCount + 1;
  const quote =
    row.status === "open" && nextUnit <= row.editionCap
      ? {
          unitNumber: nextUnit,
          priceUsd: priceUsdForUnitNumber(nextUnit),
          nextPriceUsd: nextUnit < row.editionCap ? priceUsdForUnitNumber(nextUnit + 1) : null,
          unitsRemaining,
          editionCap: row.editionCap,
        }
      : null;

  return {
    slug: row.slug,
    title: row.title,
    subtitle: catalog?.subtitle ?? "",
    imageUrl: row.imageUrl,
    description: catalog?.description ?? "",
    editionCap: row.editionCap,
    soldCount: row.soldCount,
    status: row.status,
    fromPriceUsd: quote?.priceUsd ?? priceUsdForUnitNumber(row.editionCap),
    unitsRemaining,
    quote,
  };
}

export async function getMerchCatalogLive() {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      ok: true as const,
      drops: MERCH_DROPS.map((d) => {
        const quote = merchLadderQuote(0);
        return {
          ...d,
          editionCap: merchEditionCap(),
          soldCount: 0,
          status: "open",
          fromPriceUsd: quote?.priceUsd ?? priceUsdForUnitNumber(1),
          unitsRemaining: merchEditionCap(),
          quote,
        };
      }),
    };
  }

  await ensureMerchDrops(prisma);
  await releaseExpiredMerchReservations(prisma);
  const catalogSlugs = new Set(MERCH_DROPS.map((d) => d.slug));
  const rows = await prisma.merchDrop.findMany({
    where: { slug: { in: [...catalogSlugs] } },
    orderBy: { slug: "asc" },
  });

  const drops = await Promise.all(
    rows.map(async (row) => {
      const activeCount = await countActiveMerchSlots(prisma, row.slug);
      return buildDropCatalogRow(row, activeCount);
    }),
  );

  return { ok: true as const, drops };
}

export async function reserveMerchUnit(input: {
  dropSlug: string;
  size: string;
  wallet: string;
  shipping: MerchShippingBrief;
  paymentRail: "stripe" | "x402";
  priceUsd?: number;
}) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const catalog = getMerchDrop(input.dropSlug);
  if (!catalog) return { ok: false as const, error: "unknown_drop" };

  await ensureMerchDrops(prisma);
  await releaseExpiredMerchReservations(prisma);

  const reservedUntil = new Date(Date.now() + merchReserveTtlMinutes() * 60_000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const drop = await tx.merchDrop.findUnique({ where: { slug: input.dropSlug } });
      if (!drop) return { ok: false as const, error: "unknown_drop" };
      if (drop.status !== "open") {
        return { ok: false as const, error: "sold_out" };
      }

      const activeCount = await countActiveMerchSlots(tx, drop.slug);
      if (activeCount >= drop.editionCap) {
        return { ok: false as const, error: "sold_out" };
      }

      const unitNumber = activeCount + 1;
      const priceUsd = input.priceUsd ?? priceUsdForUnitNumber(unitNumber);
      const revenueSplit = computeMerchRevenueSplit(priceUsd);

      const order = await tx.merchOrder.create({
        data: {
          dropSlug: drop.slug,
          unitNumber,
          size: input.size,
          wallet: input.wallet.toLowerCase(),
          priceUsd,
          paymentRail: input.paymentRail,
          claimCode: claimCode(),
          shipping: input.shipping,
          revenueSplit,
          status: "pending_payment",
          reservedUntil,
        },
      });

      return {
        ok: true as const,
        order,
        priceUsd,
        dropTitle: drop.title,
        imageUrl: drop.imageUrl,
      };
    });

    return result;
  } catch (e) {
    console.warn("reserveMerchUnit failed:", e);
    return { ok: false as const, error: "reserve_failed" };
  }
}

export async function getMerchOrderForBuyer(orderId: string, wallet?: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const order = await prisma.merchOrder.findUnique({
    where: { id: orderId },
    include: { drop: true },
  });
  if (!order) return null;
  if (wallet && order.wallet !== wallet.toLowerCase()) return null;
  return order;
}

export async function getMerchOrderByClaimCode(code: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  return prisma.merchOrder.findUnique({
    where: { claimCode: code },
    include: { drop: true },
  });
}

export async function getMerchOrdersForWallet(wallet: string) {
  const prisma = getPrisma();
  if (!prisma) return [];

  const w = wallet.toLowerCase();
  const orders = await prisma.merchOrder.findMany({
    where: {
      wallet: w,
      status: { in: ["paid", "claimed", "pending_payment"] },
    },
    include: { drop: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    dropSlug: o.dropSlug,
    dropTitle: o.drop.title,
    imageUrl: o.drop.imageUrl,
    unitNumber: o.unitNumber,
    editionCap: o.drop.editionCap,
    size: o.size,
    status: o.status,
    priceUsd: Number(o.priceUsd),
    paymentRail: o.paymentRail,
    x402TxHash: o.x402TxHash,
    claimPath: `/merch/claim/${o.claimCode}`,
    claimedAt: o.claimedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function cancelMerchOrderByStripeSession(stripeSessionId: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const order = await prisma.merchOrder.findFirst({
    where: { stripeSessionId, status: "pending_payment" },
  });
  if (!order) return { ok: true as const, cancelled: false };

  await prisma.merchOrder.update({
    where: { id: order.id },
    data: { status: "cancelled" },
  });

  return { ok: true as const, cancelled: true, orderId: order.id };
}

export async function verifyMerchStripeSession(input: {
  orderId: string;
  stripeSessionId: string;
  amountTotalCents: number | null;
  metadataWallet?: string | null;
}) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const order = await prisma.merchOrder.findUnique({ where: { id: input.orderId } });
  if (!order) return { ok: false as const, error: "order_not_found" };

  if (order.stripeSessionId && order.stripeSessionId !== input.stripeSessionId) {
    return { ok: false as const, error: "session_mismatch" };
  }

  const expectedCents = Math.round(Number(order.priceUsd) * 100);
  if (input.amountTotalCents != null && input.amountTotalCents !== expectedCents) {
    return { ok: false as const, error: "amount_mismatch" };
  }

  if (input.metadataWallet && input.metadataWallet.toLowerCase() !== order.wallet.toLowerCase()) {
    return { ok: false as const, error: "wallet_mismatch" };
  }

  return { ok: true as const, order };
}

export async function markMerchOrderPaid(input: {
  orderId: string;
  paymentRail: "stripe" | "x402";
  stripeSessionId?: string;
  x402TxHash?: string;
}) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.merchOrder.findUnique({
        where: { id: input.orderId },
        include: { drop: true },
      });
      if (!order) return { ok: false as const, error: "order_not_found" };
      if (order.status === "paid" || order.status === "claimed") {
        return { ok: false as const, error: "already_paid", order };
      }
      if (order.status !== "pending_payment") {
        return { ok: false as const, error: "invalid_status", order };
      }

      const updated = await tx.merchOrder.update({
        where: { id: input.orderId },
        data: {
          status: "paid",
          paymentRail: input.paymentRail,
          stripeSessionId: input.stripeSessionId ?? order.stripeSessionId,
          x402TxHash: input.x402TxHash ?? order.x402TxHash,
          reservedUntil: null,
        },
        include: { drop: true },
      });

      await tx.merchDrop.update({
        where: { slug: updated.dropSlug },
        data: { soldCount: { increment: 1 } },
      });

      return { ok: true as const, order: updated };
    });

    if (!result.ok) return result;

    await recordCultureMemoryEvent({
      wallet: result.order.wallet,
      type: "merch_order_paid",
      payload: {
        orderId: result.order.id,
        dropSlug: result.order.dropSlug,
        unitNumber: result.order.unitNumber,
        priceUsd: Number(result.order.priceUsd),
      },
    });

    await maybeTriggerBatch(result.order.dropSlug);

    return result;
  } catch (e) {
    console.warn("markMerchOrderPaid failed:", e);
    return { ok: false as const, error: "payment_update_failed" };
  }
}

export async function maybeTriggerBatch(dropSlug: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const drop = await prisma.merchDrop.findUnique({ where: { slug: dropSlug } });
  if (!drop) return { ok: false as const, error: "unknown_drop" };
  if (drop.soldCount < drop.editionCap || drop.status !== "open") {
    return { ok: true as const, triggered: false };
  }

  const orders = await prisma.merchOrder.findMany({
    where: { dropSlug, status: { in: ["paid", "claimed"] } },
    orderBy: { unitNumber: "asc" },
  });

  if (orders.length < drop.editionCap) {
    return { ok: true as const, triggered: false };
  }

  const sizeBreakdown: Record<string, number> = {};
  for (const o of orders) {
    sizeBreakdown[o.size] = (sizeBreakdown[o.size] ?? 0) + 1;
  }

  const csvRows = [
    "unit,size,name,line1,city,postal,country,email,wallet,claimCode",
    ...orders.map((o) => {
      const s = o.shipping as MerchShippingBrief;
      return [
        o.unitNumber,
        o.size,
        s.name,
        s.line1,
        s.city,
        s.postal,
        s.country,
        s.email,
        o.wallet,
        o.claimCode,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    }),
  ];

  await prisma.merchDrop.update({
    where: { slug: dropSlug },
    data: { status: "funded", fundedAt: new Date() },
  });

  const task = await prisma.agentTask.create({
    data: {
      type: "fulfill_merch_batch",
      payload: {
        dropSlug,
        title: drop.title,
        imageUrl: drop.imageUrl,
        editionCap: drop.editionCap,
        sizeBreakdown,
        csv: csvRows.join("\n"),
        orderCount: orders.length,
      },
      priority: 6,
      createdBy: "marketplace-merch",
      assignedAgentId: "ceo-orchestrator-0",
    },
  });

  const { creditMerchEditionCompleteForDrop } =
    await import("@/server/points/merch-edition-complete-credit");
  await creditMerchEditionCompleteForDrop(prisma, dropSlug);

  await recordCultureMemoryEvent({
    type: "merch_batch_funded",
    payload: { dropSlug, taskId: task.id, orderCount: orders.length },
  });

  return { ok: true as const, triggered: true, taskId: task.id };
}

export function merchOrderX402Price(order: {
  priceUsd: { toString(): string } | number | string;
}): string {
  const n = Number(order.priceUsd);
  return merchX402PriceLabel(n);
}

export async function merchOrdersDashboard() {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      ok: true,
      drops: [],
      orders: [],
      totals: { paidOrders: 0, grossUsd: 0, productionPoolUsd: 0, fundedDrops: 0 },
    };
  }

  await ensureMerchDrops(prisma);

  const [drops, orders] = await Promise.all([
    prisma.merchDrop.findMany({ orderBy: { slug: "asc" } }),
    prisma.merchOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { drop: true },
    }),
  ]);

  const paid = orders.filter((o) => o.status === "paid" || o.status === "claimed");
  let grossUsd = 0;
  let productionPoolUsd = 0;
  for (const o of paid) {
    const price = Number(o.priceUsd);
    grossUsd += price;
    const split = o.revenueSplit as { productionUsd?: number } | null;
    productionPoolUsd += split?.productionUsd ?? price * 0.55;
  }

  return {
    ok: true,
    drops: drops.map((d) => ({
      slug: d.slug,
      title: d.title,
      editionCap: d.editionCap,
      soldCount: d.soldCount,
      status: d.status,
      fundedAt: d.fundedAt?.toISOString() ?? null,
      imageUrl: d.imageUrl,
    })),
    orders: orders.map((o) => ({
      id: o.id,
      dropSlug: o.dropSlug,
      dropTitle: o.drop.title,
      unitNumber: o.unitNumber,
      size: o.size,
      wallet: o.wallet,
      status: o.status,
      priceUsd: Number(o.priceUsd),
      paymentRail: o.paymentRail,
      claimCode: o.claimCode,
      claimedAt: o.claimedAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
    })),
    totals: {
      paidOrders: paid.length,
      grossUsd: Math.round(grossUsd * 100) / 100,
      productionPoolUsd: Math.round(productionPoolUsd * 100) / 100,
      fundedDrops: drops.filter((d) => d.status !== "open").length,
    },
  };
}

export async function markMerchOrderClaimed(orderId: string) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const updated = await prisma.merchOrder.updateMany({
    where: { id: orderId, claimedAt: null },
    data: { status: "claimed", claimedAt: new Date() },
  });

  if (updated.count === 0) {
    const order = await prisma.merchOrder.findUnique({ where: { id: orderId } });
    if (!order) return { ok: false as const, error: "order_not_found" };
    if (order.claimedAt) return { ok: true as const, alreadyClaimed: true, order };
    return { ok: false as const, error: "claim_failed" };
  }

  const order = await prisma.merchOrder.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "order_not_found" };

  return { ok: true as const, alreadyClaimed: false, order };
}
