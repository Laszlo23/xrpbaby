#!/usr/bin/env node
/**
 * Optimize social campaign PNGs → WebP + OG crops under app/public/social/.
 * Source: buildingculturelanding-main or app/public/social/_source/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "app/public");
const OUT_DIR = path.join(PUBLIC, "social");
const OG_DIR = path.join(OUT_DIR, "og");
const SOURCE_DIR =
  process.env.SOCIAL_SOURCE_DIR?.trim() ||
  path.resolve(ROOT, "../../buildingculturelanding-main/frontend/public/social");
const SLUG_MAP = JSON.parse(
  fs.readFileSync(path.join(__dirname, "social-campaign-slugs.json"), "utf8"),
);

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  try {
    const placesSharp = path.join(ROOT, "apps/places/web/node_modules/sharp");
    sharp = (await import(placesSharp)).default;
  } catch {
    console.error("sharp not found — run: npm install --save-dev sharp (from b3/)");
    process.exit(1);
  }
}

async function toWebp(input, output, maxWidth) {
  const meta = await sharp(input).metadata();
  await sharp(input)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(output);
  const inSize = fs.statSync(input).size;
  const outSize = fs.statSync(output).size;
  console.log(
    `  ${path.basename(input)} → ${path.basename(output)} (${Math.round(inSize / 1024)}KB → ${Math.round(outSize / 1024)}KB, ${meta.width}x${meta.height})`,
  );
  const outMeta = await sharp(output).metadata();
  return {
    width: outMeta.width ?? meta.width ?? 0,
    height: outMeta.height ?? meta.height ?? 0,
  };
}

async function toOgWebp(input, output) {
  await sharp(input).resize(1200, 630, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toFile(output);
  const outSize = fs.statSync(output).size;
  console.log(`  og ${path.basename(output)} (${Math.round(outSize / 1024)}KB)`);
}

function slugFor(filename) {
  const slug = SLUG_MAP[filename];
  if (!slug) {
    console.warn(`  no slug for ${filename} — skipping`);
    return null;
  }
  return slug;
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source dir missing: ${SOURCE_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OG_DIR, { recursive: true });

  const files = fs.readdirSync(SOURCE_DIR).filter((f) => /\.png$/i.test(f));
  console.log(`==> Optimizing ${files.length} PNGs from ${SOURCE_DIR}`);

  const manifestAssets = [];

  for (const file of files.sort()) {
    const slug = slugFor(file);
    if (!slug) continue;

    const input = path.join(SOURCE_DIR, file);
    const webpOut = path.join(OUT_DIR, `${slug}.webp`);
    const ogOut = path.join(OG_DIR, `${slug}-og.webp`);

    const dims = await toWebp(input, webpOut, 1200);
    await toOgWebp(input, ogOut);

    manifestAssets.push({
      id: slug,
      sourceFile: file,
      image: `/social/${slug}.webp`,
      ogImage: `/social/og/${slug}-og.webp`,
      width: dims.width,
      height: dims.height,
    });
  }

  const skeletonPath = path.join(ROOT, "app/src/content/social-campaign/manifest.skeleton.json");
  fs.mkdirSync(path.dirname(skeletonPath), { recursive: true });
  fs.writeFileSync(
    skeletonPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), assets: manifestAssets }, null, 2) + "\n",
  );
  console.log(`==> Wrote skeleton (${manifestAssets.length} assets) → ${skeletonPath}`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
