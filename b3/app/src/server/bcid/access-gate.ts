import type { BcidScores } from "@/lib/identity/bcid-reputation";
import { getPrisma } from "@/server/db/prisma";

export type BcidAccessRule = {
  slug: string;
  resourceType: string;
  resourceId: string;
  minBuilderScore: number;
  requiredCredentialSlugs: string[];
};

function parseMinBuilderScore(description: string): number {
  const match = description.match(/minBuilderScore:\s*(\d+)/);
  return match ? Number(match[1]) : 0;
}

export async function getBcidAccessRule(slug: string): Promise<BcidAccessRule | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const rule = await prisma.accessRule.findUnique({ where: { slug } });
  if (!rule) return null;

  return {
    slug: rule.slug,
    resourceType: rule.resourceType,
    resourceId: rule.resourceId,
    minBuilderScore: parseMinBuilderScore(rule.description),
    requiredCredentialSlugs: rule.requiredCredentialSlugs,
  };
}

export async function checkBcidAccess(input: {
  bcidIdentityId: string;
  ruleSlug: string;
  scores?: BcidScores | null;
}): Promise<{ allowed: boolean; reason?: string }> {
  const prisma = getPrisma();
  if (!prisma) return { allowed: false, reason: "database_unavailable" };

  const rule = await getBcidAccessRule(input.ruleSlug);
  if (!rule) return { allowed: false, reason: "unknown_rule" };

  let scores = input.scores;
  if (!scores) {
    const row = await prisma.bcidReputationScore.findUnique({
      where: { bcidIdentityId: input.bcidIdentityId },
    });
    scores = row
      ? {
          builder: row.builder,
          trust: row.trust,
          contribution: row.contribution,
          verification: row.verification,
        }
      : { builder: 0, trust: 0, contribution: 0, verification: 0 };
  }

  if (scores.builder < rule.minBuilderScore) {
    return { allowed: false, reason: "insufficient_builder_score" };
  }

  if (rule.requiredCredentialSlugs.length > 0) {
    const held = await prisma.bcidCredential.findMany({
      where: {
        bcidIdentityId: input.bcidIdentityId,
        slug: { in: rule.requiredCredentialSlugs },
        status: "active",
      },
    });
    const heldSlugs = new Set(held.map((c) => c.slug));
    for (const required of rule.requiredCredentialSlugs) {
      if (!heldSlugs.has(required)) {
        return { allowed: false, reason: `missing_credential:${required}` };
      }
    }
  }

  return { allowed: true };
}
