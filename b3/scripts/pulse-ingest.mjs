#!/usr/bin/env node
/**
 * Run Culture Pulse social ingest (all enabled adapters).
 * Usage: node scripts/pulse-ingest.mjs
 * Requires DATABASE_URL in app/.env (loaded via dotenv).
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, "app/.env") });

const { PrismaClient } = await import("@prisma/client");
const { runPulseIngest } = await import(
  "../app/src/server/pulse/ingest.ts"
);
const { pulseStreamFlags } = await import(
  "../app/src/server/pulse/config.ts"
);

const prisma = new PrismaClient();
try {
  const flags = pulseStreamFlags();
  console.log("Stream flags:", flags);
  const result = await runPulseIngest(prisma);
  console.log("Ingested:", result.ingested, result.adapters);
} finally {
  await prisma.$disconnect();
}
