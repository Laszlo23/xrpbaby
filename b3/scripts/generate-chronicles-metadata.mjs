#!/usr/bin/env node
/**
 * Generate ERC-1155 metadata JSON for Culture Chronicles editions 1–11.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const META_DIR = path.join(__dirname, "../app/public/chronicles/metadata");

/** Keep in sync with app/src/content/culture-chronicles.ts */
const CHAPTERS = [
  { editionId: 1, title: "The Feed Explained", slug: "pop-culture", tier: "common", mood: "focus", pillars: ["impact"], narration: "Pop culture isn't random — it's engineered attention.", easterEgg: null, bucket: "popcultureexplain" },
  { editionId: 2, title: "The Standard", slug: "the-standard", tier: "common", mood: "focus", pillars: ["credentials", "reputation"], narration: "Likes are the old scoreboard. Credentials are the new one.", easterEgg: null, bucket: "standartexplain" },
  { editionId: 3, title: "Once Upon a Scroll", slug: "story-begins", tier: "common", mood: "idle", pillars: ["identity"], narration: "You're not background NPC energy. You're the main character.", easterEgg: null, bucket: "story" },
  { editionId: 4, title: "Father of the Culture", slug: "father-figure", tier: "uncommon", mood: "focus", pillars: ["identity", "impact"], narration: "Legacy isn't inherited. It's compiled commit by commit.", easterEgg: null, bucket: "father" },
  { editionId: 5, title: "The Gang Assembles", slug: "the-gang", tier: "uncommon", mood: "win", pillars: ["access", "impact"], narration: "Crew > clout. Always.", easterEgg: null, bucket: "gang" },
  { editionId: 6, title: "Friends (Not Frienmds)", slug: "friends-not-frienmds", tier: "common", mood: "win", pillars: ["impact"], narration: "Real friends roast your typos and still mint with you.", easterEgg: "frienmds", bucket: "frienmds" },
  { editionId: 7, title: "Relate Daily", slug: "relate-daily", tier: "common", mood: "guilt", pillars: ["impact"], narration: "Small steps today. Big legacy tomorrow.", easterEgg: null, bucket: "relate" },
  { editionId: 8, title: "Reputation Upgrade", slug: "reputation-upgrade", tier: "rare", mood: "win", pillars: ["reputation", "credentials"], narration: "Because likes don't pay rent.", easterEgg: null, bucket: "reputation" },
  { editionId: 9, title: "Evolution", slug: "evolution", tier: "rare", mood: "idle", pillars: ["identity", "credentials", "reputation", "access", "impact"], narration: "Same human needs. Upgraded infrastructure.", easterEgg: null, bucket: "evolution" },
  { editionId: 10, title: "Park Token", slug: "park-token", tier: "uncommon", mood: "focus", pillars: ["identity", "impact"], narration: "We own it. We build it. We earn together.", easterEgg: null, bucket: "parktoken" },
  { editionId: 11, title: "Vibe Friends", slug: "vibe-friends", tier: "legendary", mood: "win", pillars: ["reputation", "access", "impact"], narration: "Cartoon capital is cute. Culture capital is forever.", easterEgg: null, bucket: "veefriends" },
];

function main() {
  fs.mkdirSync(META_DIR, { recursive: true });
  const origin =
    process.env.CHRONICLES_METADATA_ORIGIN?.trim() || "https://app.buildingcultureid.space";
  const bucket = "https://0xlaszlo.4everbucket.com/buildingculture";

  for (const ch of CHAPTERS) {
    const image = `${origin}/chronicles/${ch.slug}.webp`;
    const fallback = `${bucket}/${ch.bucket}.png`;
    const meta = {
      name: `Culture Chronicles — ${ch.title}`,
      description: ch.narration,
      image,
      image_fallback: fallback,
      external_url: `${origin}/chronicles/ch-${String(ch.editionId).padStart(2, "0")}`,
      attributes: [
        { trait_type: "Chapter", value: ch.editionId },
        { trait_type: "Tier", value: ch.tier },
        { trait_type: "Mood", value: ch.mood },
        ...ch.pillars.map((p) => ({ trait_type: "Pillar", value: p })),
        ...(ch.easterEgg ? [{ trait_type: "EasterEgg", value: ch.easterEgg }] : []),
      ],
    };
    fs.writeFileSync(
      path.join(META_DIR, `${ch.editionId}.json`),
      `${JSON.stringify(meta, null, 2)}\n`,
    );
    console.log(`wrote ${ch.editionId}.json`);
  }
}

main();
