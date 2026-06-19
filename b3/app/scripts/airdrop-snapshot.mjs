#!/usr/bin/env node
/**
 * Snapshot PointLedger balances → AirdropCampaign + AirdropAllocation.
 * Usage:
 *   CAMPAIGN_SLUG=points-launch-2026 POINTS_PER_BCC_WEI=1000000000000000 node scripts/airdrop-snapshot.mjs
 */
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const campaignSlug = process.env.CAMPAIGN_SLUG?.trim() || `points-snapshot-${Date.now()}`;
const pointsPerBccWei = BigInt(process.env.POINTS_PER_BCC_WEI?.trim() || "0");
const minPoints = Number(process.env.SNAPSHOT_MIN_POINTS ?? "1");

function leafHash(walletAddress, amountWei) {
  return createHash("sha256").update(`${walletAddress.toLowerCase()}:${amountWei}`).digest("hex");
}

function buildMerkleRoot(leaves) {
  if (leaves.length === 0) return null;
  let layer = leaves.map((l) => Buffer.from(l, "hex"));
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1] ?? left;
      const pair = Buffer.concat([left, right].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
      next.push(createHash("sha256").update(pair).digest());
    }
    layer = next;
  }
  return `0x${layer[0].toString("hex")}`;
}

async function main() {
  if (pointsPerBccWei <= 0n) {
    console.error("Set POINTS_PER_BCC_WEI to a positive wei-per-point rate.");
    process.exit(1);
  }

  const wallets = await prisma.wallet.findMany({
    include: { ledgers: true },
  });

  const allocations = [];
  for (const w of wallets) {
    const points = w.ledgers.reduce((s, r) => s + r.delta, 0);
    if (points < minPoints) continue;
    const amountWei = (BigInt(points) * pointsPerBccWei).toString();
    allocations.push({ walletId: w.id, address: w.address, points, amountWei });
  }

  console.log(`Snapshot ${allocations.length} wallet(s) for campaign ${campaignSlug}`);

  const campaign = await prisma.airdropCampaign.upsert({
    where: { slug: campaignSlug },
    create: {
      slug: campaignSlug,
      status: "draft",
      snapshotAt: new Date(),
    },
    update: {
      snapshotAt: new Date(),
      status: "draft",
    },
  });

  await prisma.airdropAllocation.deleteMany({ where: { campaignId: campaign.id } });

  for (const a of allocations) {
    await prisma.airdropAllocation.create({
      data: {
        campaignId: campaign.id,
        walletId: a.walletId,
        pointsSnapshot: a.points,
        amountWei: a.amountWei,
      },
    });
  }

  const leaves = allocations.map((a) => leafHash(a.address, a.amountWei));
  const merkleRoot = buildMerkleRoot(leaves);

  await prisma.airdropCampaign.update({
    where: { id: campaign.id },
    data: { merkleRoot: merkleRoot ?? undefined },
  });

  console.log(
    JSON.stringify({ campaignSlug, allocations: allocations.length, merkleRoot }, null, 2),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
