import type { PrismaClient } from "@prisma/client";
import { ECOSYSTEM_APPS } from "@bc/growth-intelligence/server";

import { hashApiKey } from "./auth";
import { ensureDefaultFunnels } from "./funnels";

export async function ensureGrowthApps(prisma: PrismaClient): Promise<void> {
  for (const app of ECOSYSTEM_APPS) {
    const apiKeyEnv = process.env[`GI_API_KEY_${app.slug.replace(/-/g, "_").toUpperCase()}`];
    const row = await prisma.growthApp.upsert({
      where: { slug: app.slug },
      create: {
        slug: app.slug,
        name: app.name,
        domain: app.domain,
        tier: app.tier,
        apiKeyHash: apiKeyEnv ? hashApiKey(apiKeyEnv) : null,
      },
      update: {
        name: app.name,
        domain: app.domain,
        tier: app.tier,
        ...(apiKeyEnv ? { apiKeyHash: hashApiKey(apiKeyEnv) } : {}),
      },
    });
    await ensureDefaultFunnels(prisma, row.id);
  }
}

export async function resolveAppBySlug(
  prisma: PrismaClient,
  slug: string,
): Promise<{ id: string; slug: string } | null> {
  const app = await prisma.growthApp.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });
  return app;
}
