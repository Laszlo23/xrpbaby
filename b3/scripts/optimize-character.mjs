#!/usr/bin/env node
/**
 * Optimize BC+ character meme assets: hero WebP @ 1280w + thumb WebP @ 480w.
 * Reads from app/public/character/source/*.png (semantic names).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CHAR_DIR = path.join(ROOT, "app/public/character");
const SOURCE_DIR = path.join(CHAR_DIR, "source");
const THUMBS_DIR = path.join(CHAR_DIR, "thumbs");

/** Original filename → semantic slug (without extension) */
export const CHARACTER_RENAME_MAP = {
  "704dc9c9-474b-405e-808a-a5ca185c5816.png": "historical-vs",
  "ChatGPT Image 18. Juni 2026, 19_45_05.png": "farm-vs-build",
  "ChatGPT Image 18. Juni 2026, 19_24_57.png": "reputation-upgrade",
  "ChatGPT Image 18. Juni 2026, 19_09_36.png": "meme-edition",
  "ChatGPT Image 18. Juni 2026, 19_38_37.png": "early-legend",
  "parktoken.png": "park-token",
  "evolution.png": "evolution",
  "relate.png": "relate-daily",
  "ChatGPT Image 18. Juni 2026, 20_50_05.png": "relate-loop",
  "ChatGPT Image 18. Juni 2026, 19_27_25.png": "culture-upgrade",
  "ChatGPT Image 18. Juni 2026, 20_40_48.png": "better-choices",
  "ChatGPT Image 18. Juni 2026, 17_00_32.png": "culture-manifesto",
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

function prepareSourceFiles() {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  fs.mkdirSync(THUMBS_DIR, { recursive: true });

  for (const [original, slug] of Object.entries(CHARACTER_RENAME_MAP)) {
    const srcPath = path.join(CHAR_DIR, original);
    const destPath = path.join(SOURCE_DIR, `${slug}.png`);
    if (!fs.existsSync(srcPath)) {
      if (fs.existsSync(destPath)) continue;
      console.warn(`  skip missing source: ${original}`);
      continue;
    }
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  staged source: ${slug}.png`);
    }
  }
}

async function optimizeAll() {
  const sources = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort();

  if (sources.length === 0) {
    console.error("No PNG sources in character/source — run prepare first.");
    process.exit(1);
  }

  console.log(`==> Character heroes (${sources.length} files)`);
  for (const file of sources) {
    const slug = file.replace(/\.png$/, "");
    const input = path.join(SOURCE_DIR, file);
    await toWebp(input, path.join(CHAR_DIR, `${slug}.webp`), 1280);
    await toWebp(input, path.join(THUMBS_DIR, `${slug}.webp`), 480);
  }
}

async function main() {
  console.log("==> Prepare character source files");
  prepareSourceFiles();
  await optimizeAll();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
