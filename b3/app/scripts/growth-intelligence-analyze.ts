#!/usr/bin/env tsx
/**
 * Nightly Growth Intelligence analysis.
 * Usage: npm run gi:analyze [-- --app=bc-id]
 */
import { PrismaClient } from "@prisma/client";

import {
  runDailyAnalysisAll,
  runDailyAnalysisForApp,
} from "../src/server/growth-intelligence/analyze-job";
import { ensureGrowthApps } from "../src/server/growth-intelligence/seed";

const prisma = new PrismaClient();
const appFilter = process.argv.find((a) => a.startsWith("--app="))?.split("=")[1];

async function main() {
  await ensureGrowthApps(prisma);

  if (appFilter) {
    const app = await prisma.growthApp.findUnique({ where: { slug: appFilter } });
    if (!app) {
      console.error(`Unknown app: ${appFilter}`);
      process.exit(1);
    }
    const result = await runDailyAnalysisForApp(prisma, app.id, app.name);
    console.log(result.report);
    return;
  }

  await runDailyAnalysisAll(prisma);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
