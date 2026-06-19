#!/usr/bin/env node
/**
 * Seed 10 curated outreach targets + forum-draft touches for BCID pilot program.
 * Run: node scripts/seed-outreach-targets.mjs
 * Requires DATABASE_URL (loads app/.env if present).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, "app/.env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const GRANT_PROOF = "https://app.buildingcultureid.space/grant-proof";

const TARGETS = [
  {
    name: "Base Builder Grants",
    segment: "l2_foundation",
    channel: "forum",
    contactUrl: "https://docs.base.org/get-started/get-funded",
    notes: "Priority 1 retroactive nomination — grant-proof in every touch",
  },
  {
    name: "Optimism Atlas",
    segment: "l2_foundation",
    channel: "forum",
    contactUrl: "https://atlas.optimism.io/",
    notes: "Public goods narrative — verification scripts open source",
  },
  {
    name: "Snapshot Labs",
    segment: "dao_tooling",
    channel: "email",
    contactEmail: "partnerships@snapshot.org",
    contactUrl: "https://snapshot.org/",
    notes: "Path B — BCID credential gating for votes",
  },
  {
    name: "Safe (wallet)",
    segment: "dao_tooling",
    channel: "email",
    contactEmail: "partners@safe.global",
    contactUrl: "https://safe.global/",
    notes: "DAO treasury + contributor BCID pilot",
  },
  {
    name: "Guild.xyz",
    segment: "dao_tooling",
    channel: "email",
    contactEmail: "hello@guild.xyz",
    contactUrl: "https://guild.xyz/",
    notes: "bcid-builder credential as guild role",
  },
  {
    name: "Ethereum Attestation Service",
    segment: "identity_protocol",
    channel: "forum",
    contactUrl: "https://discuss.attest.org/",
    notes: "EAS schema pack RFC — forum post in OUTREACH_PLAYBOOK",
  },
  {
    name: "ERC-8004 Registry",
    segment: "identity_protocol",
    channel: "forum",
    contactUrl: "https://eips.ethereum.org/EIPS/eip-8004",
    notes: "Agent BCID in agent-card metadata",
  },
  {
    name: "Regen Coordination",
    segment: "rwa_dao",
    channel: "email",
    contactEmail: "team@regencoordination.xyz",
    contactUrl: "https://www.regencoordination.xyz/",
    notes: "Places RWA + BCID applicant identity",
  },
  {
    name: "HackQuest",
    segment: "hackathon",
    channel: "email",
    contactEmail: "hello@hackquest.io",
    contactUrl: "https://hackquest.io/",
    notes: "BCID as hackathon submission identity",
  },
  {
    name: "Arbitrum Foundation Grants",
    segment: "l2_foundation",
    channel: "forum",
    contactUrl: "https://arbitrum.foundation/grants",
    notes: "Cross-L2 identity pilot narrative",
  },
];

const FORUM_DRAFT = (name) => `**BCID pilot — portable builder identity for ${name}**

Building Culture ships BCID — a soulbound DID that complements ENS and EAS. We're offering free pilots to 3–5 DAOs/ecosystems.

- Live mint + .culture bridge: https://app.buildingcultureid.space/bcid
- Grant verifier: ${GRANT_PROOF}
- RFC (comment until 2026-08-18): https://app.buildingcultureid.space/docs/rfc
- Partnership brief: https://github.com/Laszlo23/xrpbaby/blob/main/b3/docs/protocol/DAO_PARTNERSHIP_BRIEF.md

Feedback: https://app.buildingcultureid.space/voice
Contact: hello@buildingcultureid.space`;

const EMAIL_DRAFT = (name) => ({
  subject: `BCID pilot — portable builder identity for ${name}`,
  body: `Hi,

I'm Laszlo from Building Culture. We shipped BCID — a soulbound builder identity that complements ENS and EAS — and we're offering free pilots to 3–5 DAOs.

What you get:
- Contributor BCIDs (mint or bridge from .culture)
- dao-member + grant-applicant credentials
- Public resolve API — no indexer required for v1

Live proof: ${GRANT_PROOF}
Docs: https://app.buildingcultureid.space/docs/bcid
RFC: https://app.buildingcultureid.space/docs/rfc

Would a 20-min call work to explore integration?

Best,
Laszlo · hello@buildingcultureid.space`,
});

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  let created = 0;
  let touches = 0;

  for (const t of TARGETS) {
    const existing = await prisma.outreachTarget.findFirst({
      where: { name: t.name },
    });
    if (existing) {
      console.log(`skip (exists): ${t.name}`);
      continue;
    }

    const target = await prisma.outreachTarget.create({
      data: {
        id: randomUUID(),
        name: t.name,
        segment: t.segment,
        channel: t.channel,
        contactEmail: t.contactEmail ?? null,
        contactUrl: t.contactUrl ?? null,
        notes: t.notes ?? null,
        grantProofUrl: GRANT_PROOF,
        status: "prospect",
      },
    });
    created++;

    const email = t.channel === "email" ? EMAIL_DRAFT(t.name) : null;
    await prisma.outreachTouch.create({
      data: {
        id: randomUUID(),
        targetId: target.id,
        channel: t.channel,
        status: "draft",
        emailSubject: email?.subject ?? null,
        emailBody: email?.body ?? null,
        forumPost: FORUM_DRAFT(t.name),
        followUpVariants: [
          `Following up on BCID pilot for ${t.name} — grant proof still green: ${GRANT_PROOF}`,
          `Quick bump — happy to share DAO partnership brief and API docs if useful.`,
          `Last note — RFC comment period open until Aug 2026. /voice feedback welcome.`,
        ],
        grantProofUrl: GRANT_PROOF,
      },
    });
    touches++;
  }

  // Mark 3 targets as pilot conversations (plan: close 3 DAO pilots)
  const pilotNames = ["Snapshot Labs", "Guild.xyz", "HackQuest"];
  for (const name of pilotNames) {
    await prisma.outreachTarget.updateMany({
      where: { name },
      data: { status: "pilot" },
    });
  }

  console.log(`Done: ${created} targets, ${touches} draft touches, 3 marked pilot`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
