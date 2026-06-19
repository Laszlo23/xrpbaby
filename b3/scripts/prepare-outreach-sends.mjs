#!/usr/bin/env node
/**
 * Export outreach forum drafts + email previews for manual posting/sending.
 * Usage: node scripts/prepare-outreach-sends.mjs
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, "app/.env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const SEND_ORDER = ["Guild.xyz", "HackQuest", "Snapshot Labs"];

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  const targets = await prisma.outreachTarget.findMany({
    where: { name: { in: SEND_ORDER } },
    include: { touches: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const outDir = resolve(root, "proof-bundles");
  const lines = ["# Outreach send queue — human approve at /ops/outreach", ""];

  for (const name of SEND_ORDER) {
    const t = targets.find((x) => x.name === name);
    if (!t) {
      lines.push(`## ${name}\n\n(not found — run npm run outreach:seed)\n`);
      continue;
    }
    const touch = t.touches[0];
    lines.push(`## ${name}`);
    lines.push(`- Status: ${t.status} · Email: ${t.contactEmail ?? "forum only"}`);
    if (touch?.emailSubject) lines.push(`- Subject: ${touch.emailSubject}`);
    if (touch?.emailBody) lines.push(`\n### Email\n\n${touch.emailBody}\n`);
    if (touch?.forumPost) lines.push(`\n### Forum\n\n${touch.forumPost}\n`);
    lines.push(`- Touch ID: ${touch?.id ?? "none"}`);
    lines.push("");
  }

  const outPath = resolve(outDir, "outreach-send-queue.md");
  writeFileSync(outPath, lines.join("\n"));
  console.log(`Wrote ${outPath}`);
  console.log("Approve sends at /ops/outreach (requires OPS_DASHBOARD_SECRET + RESEND_API_KEY)");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
