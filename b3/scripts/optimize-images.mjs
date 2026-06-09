#!/usr/bin/env node
/**
 * Optimize public images: landing WebP, OG PNGs, favicon set, tonconnect icon.
 * Requires: sharp (from apps/places/web or root devDependency)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "app/public");

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  try {
    const placesSharp = path.join(ROOT, "apps/places/web/node_modules/sharp");
    sharp = (await import(placesSharp)).default;
  } catch (e) {
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
  console.log(`  ${path.basename(input)} → ${path.basename(output)} (${Math.round(inSize / 1024)}KB → ${Math.round(outSize / 1024)}KB)`);
}

async function svgToPng(svgPath, pngPath, width, height) {
  await sharp(svgPath).resize(width, height).png({ compressionLevel: 9 }).toFile(pngPath);
  console.log(`  ${path.basename(svgPath)} → ${path.basename(pngPath)} (${width}x${height})`);
}

async function pngResize(input, output, width, height) {
  await sharp(input).resize(width, height, { fit: "cover" }).png({ compressionLevel: 9 }).toFile(output);
  console.log(`  ${path.basename(input)} → ${path.basename(output)}`);
}

async function main() {
  console.log("==> Landing PNG → WebP");
  const landingDir = path.join(PUBLIC, "landing");
  const landingFiles = ["old.png", "newoverlay.png", "building1.png", "investors.png", "bs_trans.png"];
  for (const f of landingFiles) {
    const input = path.join(landingDir, f);
    if (!fs.existsSync(input)) {
      console.warn(`  skip missing ${f}`);
      continue;
    }
    const maxW = f === "bs_trans.png" ? 1024 : 1280;
    await toWebp(input, path.join(landingDir, f.replace(/\.png$/, ".webp")), maxW);
  }

  console.log("==> OG PNGs from SVG (1200x630)");
  const ogPairs = [
    ["home-meta.svg", "home-meta-og.png"],
    ["0xmeta.svg", "0xmeta-og.png"],
    ["eco-meta.svg", "eco-meta-og.png"],
  ];
  for (const [svg, png] of ogPairs) {
    const svgPath = path.join(PUBLIC, "meta", svg);
    if (fs.existsSync(svgPath)) {
      await svgToPng(svgPath, path.join(PUBLIC, "meta", png), 1200, 630);
    }
  }

  console.log("==> og-default.png (root, for 0G AgentId)");
  const homeSvg = path.join(PUBLIC, "meta", "home-meta.svg");
  if (fs.existsSync(homeSvg)) {
    await svgToPng(homeSvg, path.join(PUBLIC, "og-default.png"), 1200, 630);
  }

  console.log("==> Favicon set");
  const iconSvg = path.join(PUBLIC, "brand", "miniapp-icon.svg");
  if (fs.existsSync(iconSvg)) {
    fs.copyFileSync(iconSvg, path.join(PUBLIC, "icon.svg"));
    await pngResize(iconSvg, path.join(PUBLIC, "apple-touch-icon.png"), 180, 180);
    await pngResize(iconSvg, path.join(PUBLIC, "meta", "tonconnect-icon.png"), 180, 180);
    await sharp(iconSvg).resize(32, 32).png().toFile(path.join(PUBLIC, "favicon-32.png"));
    await sharp(iconSvg).resize(16, 16).png().toFile(path.join(PUBLIC, "favicon-16.png"));
    // favicon.ico from 32px PNG
    await sharp(path.join(PUBLIC, "favicon-32.png")).toFile(path.join(PUBLIC, "favicon.ico"));
    console.log("  favicon.ico, icon.svg, apple-touch-icon.png, tonconnect-icon.png");
  }

  console.log("==> Compress legacy OG PNGs if present");
  for (const name of ["home-meta.png", "0xmeta.png", "eco-meta.png"]) {
    const p = path.join(PUBLIC, "meta", name);
    if (!fs.existsSync(p)) continue;
    const tmp = p + ".tmp";
    await sharp(p).resize(1200, 630, { fit: "inside" }).png({ compressionLevel: 9, quality: 85 }).toFile(tmp);
    fs.renameSync(tmp, p);
    console.log(`  compressed ${name}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
