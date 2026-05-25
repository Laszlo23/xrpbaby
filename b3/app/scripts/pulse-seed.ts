/**
 * Seed native Culture Pulse posts for local/demo (no external APIs).
 * Usage: npm run pulse:seed
 */
import { loadAppEnv } from "./load-env";

loadAppEnv();

import { getPrisma } from "@/server/db/prisma";
import { captureGrowthSnapshot, createNativeFeedItem } from "@/server/pulse/ingest";

const SEED_POSTS = [
  {
    content:
      "Welcome to Culture Pulse — one transparent view of forest growth, social streams, and community conversation.",
    authorName: "Building Culture",
  },
  {
    content:
      "Members earn Culture Points through quests and onboarding. Daily growth is anchored on Base when attestation is enabled.",
    authorName: "Forest",
  },
  {
    content:
      "Connect Farcaster, X, Facebook, or TikTok by setting stream flags in app/.env — then run npm run pulse:ingest.",
    authorName: "Ops",
  },
];

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error("DATABASE_URL not configured");
    process.exit(1);
  }

  for (const post of SEED_POSTS) {
    await createNativeFeedItem(prisma, {
      content: post.content,
      authorName: post.authorName,
      externalId: `seed-${post.authorName?.toLowerCase().replace(/\s+/g, "-")}`,
    });
  }

  await captureGrowthSnapshot(prisma);
  console.log(`Seeded ${SEED_POSTS.length} native posts + growth snapshot.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
