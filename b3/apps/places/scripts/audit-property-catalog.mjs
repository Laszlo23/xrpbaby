#!/usr/bin/env node
/**
 * Audits ST-IMMO catalog alignment: property-catalog.json vs demo-properties + supply caps.
 * Usage: node scripts/audit-property-catalog.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const repoRoot = join(root, "../..");
const catalogPath = join(root, "data/property-catalog.json");
const appCatalogPath = join(repoRoot, "app/src/data/property-catalog.json");
const demoPath = join(root, "web/src/lib/demo-properties.ts");
const stImmoPath = join(root, "web/src/lib/st-immo-buildings.ts");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const appCatalog = JSON.parse(readFileSync(appCatalogPath, "utf8"));
const demoSrc = readFileSync(demoPath, "utf8");
const stImmoSrc = readFileSync(stImmoPath, "utf8");

function catalogDiff(a, b, labelA, labelB) {
  const issues = [];
  if (a.chainId !== b.chainId) issues.push(`chainId: ${labelA}=${a.chainId} vs ${labelB}=${b.chainId}`);
  if (a.registry !== b.registry) issues.push(`registry mismatch ${labelA} vs ${labelB}`);
  if (a.properties.length !== b.properties.length) {
    issues.push(`property count: ${labelA}=${a.properties.length} vs ${labelB}=${b.properties.length}`);
  }
  for (const entry of a.properties) {
    const other = b.properties.find((p) => p.propertyId === entry.propertyId);
    if (!other) {
      issues.push(`app catalog missing propertyId ${entry.propertyId}`);
      continue;
    }
    for (const key of ["slug", "symbol", "shareToken", "acquisitionEur", "jurisdiction"]) {
      if (entry[key] !== other[key]) {
        issues.push(`#${entry.propertyId}.${key}: places=${entry[key]} app=${other[key]}`);
      }
    }
  }
  return issues;
}

function supplyCapWei(acquisitionEur) {
  const wholeTokens = Math.floor((acquisitionEur * 110) / 100 / 1000);
  return wholeTokens * 1e18;
}

const requiredDemoFields = [
  "headline",
  "illustrativePropertyValueUsd",
  "imageSrc",
  "location",
  "documentIds",
];

const report = {
  generatedAt: new Date().toISOString(),
  ok: true,
  catalogPropertyCount: catalog.properties.length,
  stImmoSlugs: [],
  issues: [],
  properties: [],
};

const slugMatches = [...stImmoSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
report.stImmoSlugs = slugMatches;

for (const entry of catalog.properties) {
  const blockMatch =
    demoSrc.match(new RegExp(`\\s${entry.propertyId}:\\s*\\{`)) ??
    demoSrc.match(new RegExp(`\\s${entry.propertyId}:\\s*DEMO_`));
  const propIssues = [];

  if (!blockMatch) {
    propIssues.push(`demo-properties missing key ${entry.propertyId}`);
  } else {
    const start = blockMatch.index ?? 0;
    const slice = demoSrc.slice(start, start + 12000);
    if (entry.propertyId !== 2) {
      for (const field of requiredDemoFields) {
        if (!slice.includes(`${field}:`)) {
          propIssues.push(`demo #${entry.propertyId} missing ${field}`);
        }
      }
    } else {
      for (const field of ["illustrativePropertyValueUsd", "imageSrc", "location", "documentIds"]) {
        if (!demoSrc.includes(`${field}:`)) {
          propIssues.push(`demo #2 shared object missing ${field}`);
        }
      }
    }
    if (entry.propertyId === 2) {
      const jagMatch = demoSrc.match(
        /DEMO_JAGDSCHLOSSGASSE_81[\s\S]*?illustrativePropertyValueUsd:\s*([\d_]+)/,
      );
      if (jagMatch) {
        const demoVal = Number(jagMatch[1].replace(/_/g, ""));
        if (demoVal !== entry.acquisitionEur) {
          propIssues.push(
            `value mismatch: demo ${demoVal} vs catalog ${entry.acquisitionEur}`,
          );
        }
      }
    } else {
      const valueMatch = slice.match(/illustrativePropertyValueUsd:\s*([\d_]+)/);
      if (valueMatch) {
        const demoVal = Number(valueMatch[1].replace(/_/g, ""));
        if (demoVal !== entry.acquisitionEur) {
          propIssues.push(
            `value mismatch: demo ${demoVal} vs catalog ${entry.acquisitionEur}`,
          );
        }
      }
    }
  }

  if (!stImmoSrc.includes(`slug: "${entry.slug}"`)) {
    propIssues.push(`st-immo-buildings missing slug ${entry.slug}`);
  }

  const demoIdInStImmo = stImmoSrc.includes(`demoPropertyId: ${entry.propertyId}`);
  if (!demoIdInStImmo && entry.propertyId <= 8) {
    propIssues.push(`st-immo missing demoPropertyId: ${entry.propertyId}`);
  }

  if (entry.propertyId <= 7 && !entry.shareToken) {
    propIssues.push("expected shareToken for seeded property");
  }
  if (entry.propertyId === 8 && !entry.shareToken) {
    propIssues.push("property 8 missing shareToken after mainnet mint");
  }

  report.properties.push({
    propertyId: entry.propertyId,
    slug: entry.slug,
    symbol: entry.symbol,
    acquisitionEur: entry.acquisitionEur,
    supplyCapWei: supplyCapWei(entry.acquisitionEur).toString(),
    shareToken: entry.shareToken,
    issues: propIssues,
  });

  if (propIssues.length) {
    report.ok = false;
    report.issues.push(...propIssues.map((i) => `#${entry.propertyId}: ${i}`));
  }
}

if (catalog.properties.length !== 8) {
  report.ok = false;
  report.issues.push(`expected 8 catalog properties, got ${catalog.properties.length}`);
}

const appCatalogIssues = catalogDiff(catalog, appCatalog, "places", "app");
if (appCatalogIssues.length) {
  report.ok = false;
  report.issues.push(...appCatalogIssues.map((i) => `app-catalog: ${i}`));
}

const outPath = join(root, "data/catalog-audit-report.json");
writeFileSync(outPath, JSON.stringify(report, null, 2));

if (!report.ok) {
  console.error("Catalog audit failed:");
  for (const issue of report.issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(`Catalog audit OK (${catalog.properties.length} properties) → ${outPath}`);
