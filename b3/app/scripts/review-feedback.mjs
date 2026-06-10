#!/usr/bin/env node
/**
 * Builder Voice admin CLI — list and review product feedback.
 *
 *   node app/scripts/review-feedback.mjs list --status pending_review
 *   node app/scripts/review-feedback.mjs set <id> useful --wall --title "Clearer join copy"
 *   node app/scripts/review-feedback.mjs set <id> gold --wall --title "Shipped wallet hint"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");

function loadEnv() {
  for (const rel of ["../deploy/.env", ".env"]) {
    const p = path.join(appRoot, rel);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const origin = (process.env.PUBLIC_APP_ORIGIN || "https://app.buildingcultureid.space").replace(
  /\/$/,
  "",
);
const secret = process.env.FEEDBACK_ADMIN_SECRET?.trim();

function usage() {
  console.log(`Usage:
  node app/scripts/review-feedback.mjs list [--status pending_review]
  node app/scripts/review-feedback.mjs set <feedbackId> <useful|gold|implemented> [--wall] [--title "Public headline"]`);
  process.exit(1);
}

async function listPending(status) {
  if (!secret) {
    console.error("Set FEEDBACK_ADMIN_SECRET in deploy/.env");
    process.exit(1);
  }
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.productFeedback.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        area: true,
        status: true,
        qualityScore: true,
        triedWhat: true,
        problem: true,
        pointsGranted: true,
        createdAt: true,
        member: { select: { farcasterUsername: true, walletAddress: true } },
      },
    });
    if (rows.length === 0) {
      console.log("No rows.");
      return;
    }
    for (const r of rows) {
      const who = r.member.farcasterUsername
        ? `@${r.member.farcasterUsername}`
        : (r.member.walletAddress?.slice(0, 10) ?? "?");
      console.log("---");
      console.log(`id: ${r.id}`);
      console.log(`status: ${r.status} · score: ${r.qualityScore} · pts: ${r.pointsGranted}`);
      console.log(`area: ${r.area} · ${who} · ${r.createdAt.toISOString()}`);
      console.log(`tried: ${r.triedWhat.slice(0, 120)}…`);
      console.log(`problem: ${r.problem.slice(0, 160)}…`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function setStatus(feedbackId, status, opts) {
  if (!secret) {
    console.error("Set FEEDBACK_ADMIN_SECRET in deploy/.env");
    process.exit(1);
  }
  const res = await fetch(`${origin}/api/feedback/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-feedback-admin-secret": secret,
    },
    body: JSON.stringify({
      feedbackId,
      status,
      showOnWall: opts.wall,
      publicTitle: opts.title,
      reviewedBy: "cli",
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(json);
    process.exit(1);
  }
  console.log(JSON.stringify(json, null, 2));
}

const argv = process.argv.slice(2);
const cmd = argv[0];

if (cmd === "list") {
  let status = "pending_review";
  const idx = argv.indexOf("--status");
  if (idx >= 0 && argv[idx + 1]) status = argv[idx + 1];
  await listPending(status);
} else if (cmd === "set" && argv[1] && argv[2]) {
  const wall = argv.includes("--wall");
  const titleIdx = argv.indexOf("--title");
  const title = titleIdx >= 0 ? argv[titleIdx + 1] : undefined;
  await setStatus(argv[1], argv[2], { wall, title });
} else {
  usage();
}
