#!/usr/bin/env node
/**
 * Export DAO voting weights for Snapshot merkle / manual review.
 * Reads wallets from PointLedger (distinct) or DAO_VOTING_EXPORT_WALLETS env (comma-separated).
 *
 * Usage:
 *   npm run dao:voting-export
 *   DAO_VOTING_EXPORT_WALLETS=0xabc...,0xdef... npm run dao:voting-export
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "docs/exports/dao-voting-weights.csv");

const APP_ORIGIN = process.env.PLATFORM_ORIGIN?.trim() || "http://localhost:5173";
const manual = process.env.DAO_VOTING_EXPORT_WALLETS?.split(",").map((w) => w.trim()).filter(Boolean);

async function fetchWeight(address) {
  const url = `${APP_ORIGIN}/api/dao/voting-weight?address=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`fetch failed ${address}: ${res.status}`);
  return res.json();
}

async function loadWalletsFromDb() {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) return [];
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.wallet.findMany({
      select: { address: true },
      take: 5000,
    });
    return rows.map((r) => r.address);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const wallets = manual?.length ? manual : await loadWalletsFromDb();
  if (wallets.length === 0) {
    console.error(
      "No wallets — set DAO_VOTING_EXPORT_WALLETS=0x...,0x... or DATABASE_URL for PointLedger wallets",
    );
    process.exit(1);
  }

  const lines = ["address,voteWeight,rootsWeight,powerFactor,lpFactor,counselRequired"];
  for (const address of wallets) {
    try {
      const q = await fetchWeight(address);
      if (!q.ok && q.error === "invalid_address") continue;
      lines.push(
        [
          address,
          q.voteWeight ?? 0,
          q.components?.rootsWeight ?? 0,
          q.components?.powerFactor ?? 1,
          q.components?.lpFactor ?? 1,
          q.counselRequired ?? true,
        ].join(","),
      );
    } catch (e) {
      console.warn(String(e));
    }
  }

  mkdirSync(resolve(ROOT, "docs/exports"), { recursive: true });
  writeFileSync(OUT, `${lines.join("\n")}\n`);
  console.log(`Wrote ${lines.length - 1} row(s) to ${OUT}`);
  console.log("Counsel sign-off required before uploading to Snapshot.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
