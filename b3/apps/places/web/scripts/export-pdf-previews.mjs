#!/usr/bin/env node
/**
 * Rasterizes PDFs in web/public to JPEG previews under web/public/extracted/{id}/page-NN.jpg
 * Requires Poppler: `brew install poppler` (pdftoppm, pdfinfo).
 *
 * Run from repo root: node web/scripts/export-pdf-previews.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(WEB_ROOT, "public");

const MANIFEST = [
  // Root `377-DROES-100-P-S-221219.pdf` has a broken xref for pdftoppm; `(1).pdf` renders.
  { id: "droes-plans-221219", file: "377-DROES-100-P-S-221219 (1).pdf", pages: 3 },
  { id: "katzelsdorf-studie-auswechslung", file: "Studie Hausumbau Katzelsdorf_A3-Mappe_AUSWECHSLUNG.pdf", pages: 3 },
  { id: "katzelsdorf-studie-encoded", file: "Studie_20Hausumbau_20Katzelsdorf_A3-Mappe_AUSWECHSLUNG.pdf.pdf", pages: 3 },
  { id: "bernhardsthal-plans", file: "371-BERNHARDSTHAL-100-P-S-221114.pdf.pdf", pages: 3 },
  { id: "altes-kaufhaus-prater", file: "Altes_20Kaufhaus_Pra_CC_88s_20A3_20klein.pdf.pdf", pages: 3 },
  { id: "stix-a3-klein", file: "Prä_StixA3klein.pdf", pages: 3 },
  { id: "land-mark-bernhardsthal-20210625", file: "20210625_Land-Mark-Bernhardsthal.pdf", pages: 3 },
  { id: "bau-land-kultur-20201113", file: "20201113-Bau-Land-Kultur.pdf", pages: 3 },
  { id: "stix-baukultur-en-20221110", file: "20221110_Stix_Baukultur_EN_Web.pdf", pages: 3 },
  { id: "water-side-keutschach-20220112", file: "20220112_WATER-SIDE-Keutschach-am-See (1).pdf", pages: 3 },
  { id: "teaser-biberstrasse-4-1010-wien", file: "Teaser-Biberstrasse-4-1010-Wien.pdf", pages: 3 },
  { id: "vkp-lageplan-20220622", file: "1169_VKP_Lageplan_2022-06-22.pdf", pages: 1 },
  { id: "vkp-pool-20220308", file: "1169_VKP_Pool_2022-03-08.pdf", pages: 1 },
  { id: "vkp-haus-a-og-top3-20221102", file: "1169_VKP_Haus A_OG_Top3_2022-11-02.pdf", pages: 1 },
  { id: "vkp-haus-b-eg-top1-20220516", file: "1169_VKP_Haus B_EG_Top 1_2022-05-16.pdf", pages: 1 },
  { id: "vkp-haus-c-eg-top2-20220308", file: "1169_VKP_Haus C_EG_Top 2_2022-03-08.pdf", pages: 1 },
  { id: "vkp-haus-e-eg-top1-20220308", file: "1169_VKP_Haus E_EG_Top 1_2022-03-08.pdf", pages: 1 },
  { id: "vkp-haus-e-eg-top3-20230316", file: "1169_VKP_Haus E_EG_Top 3_2023-03-16.pdf", pages: 1 },
  { id: "vkp-haus-e-up-tg-kg-20230621", file: "1169_VKP_Haus E_ÜP_TG+KG_2023-06-21.pdf", pages: 1 },
  { id: "vkp-felsennest-eg-top1-20220315", file: "1169_VKP_Felsennest_EG_Top 1_2022-03-15.pdf", pages: 1 },
];

function pdfPageCount(pdfPath) {
  try {
    const out = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
    const m = out.match(/Pages:\s*(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  } catch {
    return 1;
  }
}

function rmDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
}

for (const { id, file, pages: wantPages } of MANIFEST) {
  const pdfPath = path.join(PUBLIC, file);
  if (!fs.existsSync(pdfPath)) {
    console.warn(`SKIP missing PDF: ${file}`);
    continue;
  }

  const outDir = path.join(PUBLIC, "extracted", id);
  rmDir(outDir);
  fs.mkdirSync(outDir, { recursive: true });

  let totalPages = 1;
  try {
    totalPages = pdfPageCount(pdfPath);
  } catch {
    /* keep 1 */
  }
  const last = Math.min(wantPages, Math.max(1, totalPages));
  const prefix = path.join(outDir, "page");

  try {
    execFileSync(
      "pdftoppm",
      ["-jpeg", "-scale-to", "1920", "-f", "1", "-l", String(last), pdfPath, prefix],
      { stdio: "pipe" },
    );
    // Single-page exports may be `page-1.jpg`; normalize to `page-01.jpg` for stable URLs.
    for (const f of fs.readdirSync(outDir)) {
      const m = /^page-(\d+)\.jpg$/i.exec(f);
      if (!m) continue;
      const n = parseInt(m[1], 10);
      const target = `page-${String(n).padStart(2, "0")}.jpg`;
      if (f !== target) {
        fs.renameSync(path.join(outDir, f), path.join(outDir, target));
      }
    }
    console.log(`OK ${id} (${last} page(s))`);
  } catch (e) {
    console.warn(`FAIL ${id} (${file}): ${e?.message ?? e}`);
    rmDir(outDir);
  }
}

console.log("Done.");
