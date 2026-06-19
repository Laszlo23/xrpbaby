/**
 * Seed credential issuers, credentials, access rules, and agent identities.
 * Run: npx tsx prisma/seed-credentials.ts
 */
import { PrismaClient } from "@prisma/client";

import { ACCESS_RULES, CREDENTIAL_CATALOG } from "../src/lib/credentials/credential-catalog.ts";

const prisma = new PrismaClient();

const XRPL_MAPPINGS: Record<string, object> = {
  builder: { credentialType: "Professional", subject: "CultureIdentity" },
  contributor: { credentialType: "Participation", subject: "CultureIdentity" },
  "community-leader": { credentialType: "CommunityRole", role: "Leader" },
  "verified-human": { credentialType: "VerifiedIdentity", subject: "CultureIdentity" },
  "trusted-agent": { credentialType: "Agent", controller: "AgentIdentity.wallet" },
  "verified-project": { credentialType: "Organization", issuer: "building-culture" },
  "limited-merch-holder": { credentialType: "Participation", subject: "MerchOrder" },
};

async function main() {
  const issuer = await prisma.credentialIssuer.upsert({
    where: { slug: "building-culture" },
    create: {
      slug: "building-culture",
      name: "Building Culture",
      verified: true,
    },
    update: { name: "Building Culture", verified: true },
  });

  for (const entry of CREDENTIAL_CATALOG) {
    await prisma.credential.upsert({
      where: { slug: entry.slug },
      create: {
        slug: entry.slug,
        name: entry.name,
        description: entry.description,
        category: entry.category,
        issuerId: issuer.id,
        metadataSchema: {},
        earnRules: { summary: entry.earnSummary },
        unlocks: entry.unlocks,
        xrplMapping: XRPL_MAPPINGS[entry.slug] ?? null,
        tier: entry.slug === "verified-human" ? 2 : 1,
        active: true,
      },
      update: {
        name: entry.name,
        description: entry.description,
        unlocks: entry.unlocks,
        earnRules: { summary: entry.earnSummary },
        xrplMapping: XRPL_MAPPINGS[entry.slug] ?? null,
        active: true,
      },
    });
  }

  for (const rule of ACCESS_RULES) {
    await prisma.accessRule.upsert({
      where: { slug: rule.slug },
      create: {
        slug: rule.slug,
        resourceType: rule.resourceType,
        resourceId: rule.resourceId,
        minReputation: rule.minReputation,
        requiredCredentialSlugs: [...rule.requiredCredentialSlugs],
        description: rule.description,
      },
      update: {
        requiredCredentialSlugs: [...rule.requiredCredentialSlugs],
        description: rule.description,
      },
    });
  }

  await prisma.agentIdentity.upsert({
    where: { slug: "limx" },
    create: {
      slug: "limx",
      name: "Limx Revenue Agent",
      walletAddress: "0xf424d59831fff6d3f404abf22ec23cdb0c4f584b",
      chainId: 8453,
      agentCardUrl: "https://wallet.blockchain0x.com/a/limx",
      status: "active",
    },
    update: {
      name: "Limx Revenue Agent",
      walletAddress: "0xf424d59831fff6d3f404abf22ec23cdb0c4f584b",
      agentCardUrl: "https://wallet.blockchain0x.com/a/limx",
    },
  });

  console.log("Seeded credentials, access rules, and agent identities.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
