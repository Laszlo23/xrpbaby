#!/usr/bin/env node
/**
 * Validates REOC L3 metadata for every property in property-catalog.json.
 * Usage: node scripts/validate-reoc-metadata.mjs [--origin URL]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const catalogPath = join(root, "data/property-catalog.json");
const schemaPath = join(root, "docs/schemas/reoc-metadata-v1.json");

const originArg = process.argv.find((a) => a.startsWith("--origin="));
const origin = originArg?.slice("--origin=".length) ?? "https://app.buildingcultureid.space";

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

const required = schema.required ?? [];

function supplyCapWei(acquisitionEur) {
  const wholeTokens = Math.floor((acquisitionEur * 110) / 100 / 1000);
  return wholeTokens * 1e18;
}

function buildDocuments(entry) {
  const docs = [
    {
      kind: "DISCLOSURE",
      uri: `${origin.replace(/\/$/, "")}/places/investors`,
      label: "Investor disclosures",
    },
  ];
  if (entry.heroImage) {
    docs.unshift({
      kind: "OTHER",
      uri: `${origin.replace(/\/$/, "")}/places${entry.heroImage}`,
      label: `${entry.name} hero`,
    });
  }
  return docs;
}

function buildMeta(entry) {
  const meta = {
    reocVersion: "1.0.0",
    title: entry.name,
    description: "REOC v1 reference metadata",
    propertyId: String(entry.propertyId),
    registry: catalog.registry,
    chainId: catalog.chainId,
    jurisdiction: entry.jurisdiction,
    documents: buildDocuments(entry),
    image: `${origin.replace(/\/$/, "")}/places/meta/rwa-share-icon.svg`,
    externalRefHint: entry.slug,
  };
  if (entry.shareToken) {
    meta.token = { address: entry.shareToken, symbol: entry.symbol, decimals: 18 };
  }
  return meta;
}

function validateMeta(meta) {
  const errors = [];
  for (const key of required) {
    if (meta[key] === undefined || meta[key] === null || meta[key] === "") {
      errors.push(`missing required field: ${key}`);
    }
  }
  if (!Array.isArray(meta.documents) || meta.documents.length < 1) {
    errors.push("documents must have at least one entry");
  }
  for (const doc of meta.documents ?? []) {
    if (!doc.kind) errors.push("document missing kind");
    if (!doc.uri && !doc.storageRoot) errors.push(`document ${doc.kind} needs uri or storageRoot`);
  }
  if (meta.reocVersion !== "1.0.0") errors.push("reocVersion must be 1.0.0");
  return errors;
}

const report = {
  generatedAt: new Date().toISOString(),
  origin,
  ok: true,
  properties: [],
};

for (const entry of catalog.properties) {
  const meta = buildMeta(entry);
  const errors = validateMeta(meta);
  const expectedCap = supplyCapWei(entry.acquisitionEur);
  report.properties.push({
    propertyId: entry.propertyId,
    slug: entry.slug,
    symbol: entry.symbol,
    acquisitionEur: entry.acquisitionEur,
    expectedSupplyCapWei: expectedCap.toString(),
    shareToken: entry.shareToken,
    reocUrl: `${origin.replace(/\/$/, "")}/places/api/reoc/${entry.propertyId}`,
    errors,
  });
  if (errors.length) report.ok = false;
}

const outPath = join(root, "data/reoc-validation-report.json");
writeFileSync(outPath, JSON.stringify(report, null, 2));

if (!report.ok) {
  console.error("REOC validation failed:");
  for (const p of report.properties) {
    if (p.errors.length) console.error(`  #${p.propertyId}: ${p.errors.join("; ")}`);
  }
  process.exit(1);
}

console.log(`REOC validation OK for ${report.properties.length} properties → ${outPath}`);
