#!/usr/bin/env node
/**
 * Optimize Culture Chronicles chapter assets: hero WebP @ 1280w + thumb WebP @ 480w.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CHRON_DIR = path.join(ROOT, "app/public/chronicles");
const SOURCE_DIR = path.join(CHRON_DIR, "source");
const THUMBS_DIR = path.join(CHRON_DIR, "thumbs");

/** source filename (no ext) → chapter slug */
export const CHRONICLE_SOURCE_MAP = {
  popcultureexplain: "pop-culture",
  standartexplain: "the-standard",
  story: "story-begins",
  father: "father-figure",
  gang: "the-gang",
  frienmds: "friends-not-frienmds",
  relate: "relate-daily",
  reputation: "reputation-upgrade",
  evolution: "evolution",
  parktoken: "park-token",
  veefriends: "vibe-friends",
};

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  try {
    const placesSharp = path.join(ROOT, "apps/places/web/node_modules/sharp");
    sharp = (await import(placesSharp)).default;
  } catch {
    console.error("sharp not found — run: npm install --save-dev sharp");
    process.exit(1);
  }
}

async function toWebp(input, output, maxWidth) {
  await sharp(input)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(output);
  const inSize = fs.statSync(input).size;
  const outSize = fs.statSync(output).size;
  console.log(
    `  ${path.basename(input)} → ${path.basename(output)} (${Math.round(inSize / 1024)}KB → ${Math.round(outSize / 1024)}KB)`,
  );
}

async function main() {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  fs.mkdirSync(THUMBS_DIR, { recursive: true });

  const sources = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort();

  if (sources.length === 0) {
    console.error("No PNG sources in chronicles/source");
    process.exit(1);
  }

  console.log(`==> Chronicle heroes (${sources.length} files)`);
  for (const file of sources) {
    const base = file.replace(/\.png$/, "");
    const slug = CHRONICLE_SOURCE_MAP[base] ?? base;
    const input = path.join(SOURCE_DIR, file);
    await toWebp(input, path.join(CHRON_DIR, `${slug}.webp`), 1280);
    await toWebp(input, path.join(THUMBS_DIR, `${slug}.webp`), 480);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
