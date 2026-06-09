#!/usr/bin/env node
/**
 * Optimize Places public/ images: resize large JPGs, convert to WebP, archive masters.
 * Usage: node scripts/optimize-places-public.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "apps/places/web/public");
const MASTERS = path.join(ROOT, "assets/places-masters");

const DRY = process.argv.includes("--dry-run");
const MAX_HERO = 2000;
const MAX_CAROUSEL = 1200;
const LARGE_THRESHOLD = 500 * 1024;

const BOILERPLATE = ["vercel.svg", "next.svg", "globe.svg", "file.svg", "window.svg"];

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  sharp = (await import(path.join(ROOT, "apps/places/web/node_modules/sharp"))).default;
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (/\.(jpe?g|png|tiff?)$/i.test(ent.name)) acc.push(full);
  }
  return acc;
}

function isHeroPath(p) {
  return /\/properties\/\d+\/hero\.jpe?g$/i.test(p) || /hero/i.test(path.basename(p));
}

async function optimizeFile(filePath) {
  const st = fs.statSync(filePath);
  if (st.size <= LARGE_THRESHOLD && !/\.tiff?$/i.test(filePath)) return null;

  const rel = path.relative(PUBLIC, filePath);
  const maxDim = isHeroPath(filePath) ? MAX_HERO : MAX_CAROUSEL;
  const ext = path.extname(filePath).toLowerCase();
  const webpPath = filePath.replace(/\.(jpe?g|png|tiff?)$/i, ".webp");

  if (DRY) {
    console.log(`[dry-run] would optimize ${rel} (${Math.round(st.size / 1024)}KB)`);
    return { rel, saved: 0 };
  }

  if (!fs.existsSync(MASTERS)) fs.mkdirSync(MASTERS, { recursive: true });
  const masterDest = path.join(MASTERS, rel);
  fs.mkdirSync(path.dirname(masterDest), { recursive: true });
  if (!fs.existsSync(masterDest)) fs.copyFileSync(filePath, masterDest);

  if (/\.tiff?$/i.test(ext)) {
    fs.unlinkSync(filePath);
    console.log(`  removed TIFF ${rel} (master archived)`);
    return { rel, saved: st.size };
  }

  await sharp(filePath)
    .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(filePath + ".opt.jpg");
  fs.renameSync(filePath + ".opt.jpg", filePath);

  await sharp(filePath).webp({ quality: 82 }).toFile(webpPath);

  const newSize = fs.statSync(filePath).size;
  console.log(`  ${rel}: ${Math.round(st.size / 1024)}KB → ${Math.round(newSize / 1024)}KB + webp`);
  return { rel, saved: st.size - newSize };
}

async function main() {
  console.log(`==> Places public optimizer${DRY ? " (dry-run)" : ""}`);

  for (const name of BOILERPLATE) {
    const p = path.join(PUBLIC, name);
    if (fs.existsSync(p) && !DRY) {
      fs.unlinkSync(p);
      console.log(`  removed boilerplate ${name}`);
    }
  }

  const files = walk(PUBLIC).filter((f) => !f.endsWith(".webp"));
  let totalSaved = 0;
  for (const f of files.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size)) {
    const r = await optimizeFile(f);
    if (r) totalSaved += r.saved;
  }

  console.log(`Total saved: ~${Math.round(totalSaved / (1024 * 1024))} MB`);
  if (!DRY) console.log(`Masters archived under assets/places-masters/ (gitignored)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
