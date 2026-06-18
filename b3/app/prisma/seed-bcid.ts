/**
 * Seed BCID credential slugs (stored in BcidCredential, not legacy Credential table).
 * Run: npx tsx prisma/seed-bcid.ts
 */
import { PrismaClient } from "@prisma/client";

import { BCID_ACCESS_RULES, BCID_CREDENTIAL_CATALOG } from "../src/lib/bcid/bcid-catalog.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("BCID seed: access rules with minBuilderScore field via description metadata");

  for (const rule of BCID_ACCESS_RULES) {
    await prisma.accessRule.upsert({
      where: { slug: rule.slug },
      create: {
        slug: rule.slug,
        resourceType: rule.resourceType,
        resourceId: rule.resourceId,
        minReputation: rule.minBuilderScore > 0 ? rule.minBuilderScore / 10 : null,
        requiredCredentialSlugs: [...rule.requiredCredentialSlugs],
        description: `${rule.description} (minBuilderScore: ${rule.minBuilderScore})`,
      },
      update: {
        requiredCredentialSlugs: [...rule.requiredCredentialSlugs],
        description: `${rule.description} (minBuilderScore: ${rule.minBuilderScore})`,
      },
    });
  }

  console.log(`BCID catalog entries defined: ${BCID_CREDENTIAL_CATALOG.length}`);
  console.log("BCID credentials are issued per-identity in BcidCredential table on bridge/mint.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
