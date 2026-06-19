#!/usr/bin/env node
/**
 * Validate Grove's Neynar managed signer against NEYNAR_API_KEY.
 *
 *   node scripts/neynar-signer-check.mjs
 *   node scripts/neynar-signer-check.mjs --create   # create signer if missing/invalid
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const defaultEnvFile = path.join(appRoot, ".env");

function loadDotenvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq < 1) continue;
    const k = s.slice(0, eq).trim();
    let v = s.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function setEnvValue(filePath, key, value) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  let found = false;
  const next = lines.map((line) => {
    if (line.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) next.push(`${key}=${value}`);
  fs.writeFileSync(filePath, `${next.join("\n").replace(/\n?$/, "\n")}`);
}

const createIfMissing = process.argv.includes("--create");
const writeEnv = process.argv.includes("--write-env");
const envPath = process.env.ENV_FILE?.trim() || defaultEnvFile;
const fileEnv = loadDotenvFile(envPath);
const env = { ...fileEnv, ...process.env };

const apiKey = String(env.NEYNAR_API_KEY || "").trim();
let signerUuid = String(env.GROVE_NEYNAR_SIGNER_UUID || "").trim();

if (!apiKey) {
  console.error("Missing NEYNAR_API_KEY in", envPath);
  process.exit(2);
}

async function lookupSigner(uuid) {
  const res = await fetch(`https://api.neynar.com/v2/farcaster/signer?signer_uuid=${uuid}`, {
    headers: { "x-api-key": apiKey, accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  const raw = await res.text();
  let data = {};
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw.slice(0, 200) };
  }
  return { res, data };
}

async function createSigner() {
  const res = await fetch("https://api.neynar.com/v2/farcaster/signer", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: "{}",
    signal: AbortSignal.timeout(30_000),
  });
  const raw = await res.text();
  let data = {};
  try {
    data = JSON.parse(raw);
  } catch {
    data = { message: raw.slice(0, 200) };
  }
  if (!res.ok) {
    console.error("Failed to create signer:", data);
    process.exit(1);
  }
  return data;
}

let lookup = signerUuid
  ? await lookupSigner(signerUuid)
  : { res: { status: 404, ok: false }, data: {} };

if (!signerUuid || lookup.res.status === 404) {
  if (!signerUuid) {
    console.log("GROVE_NEYNAR_SIGNER_UUID is not set.");
  } else {
    console.log(`Signer ${signerUuid} not found for this NEYNAR_API_KEY (wrong app or deleted).`);
  }

  if (!createIfMissing) {
    console.log("\nRun with --create to provision a signer under this Neynar app:");
    console.log("  node scripts/neynar-signer-check.mjs --create --write-env");
    process.exit(1);
  }

  const created = await createSigner();
  signerUuid = String(created.signer_uuid || "").trim();
  if (!signerUuid) {
    console.error("Neynar create signer response missing signer_uuid");
    process.exit(1);
  }
  console.log(`Created signer ${signerUuid} (status: ${created.status || "unknown"})`);
  if (writeEnv) {
    setEnvValue(envPath, "GROVE_NEYNAR_SIGNER_UUID", signerUuid);
    console.log(`Wrote GROVE_NEYNAR_SIGNER_UUID to ${envPath}`);
  } else {
    console.log(`Set deploy/.env: GROVE_NEYNAR_SIGNER_UUID=${signerUuid}`);
  }
  lookup = await lookupSigner(signerUuid);
}

const signer = lookup.data?.signer ?? lookup.data;
const status = String(signer?.status || "unknown");
const fid = signer?.fid ?? null;

console.log("\nNeynar signer status");
console.log("  signer_uuid:", signerUuid);
console.log("  status:", status);
if (fid != null) console.log("  fid:", fid);

if (status === "approved") {
  console.log("\nOK — signer is approved. Grove can post to Farcaster.");
  process.exit(0);
}

if (status === "generated") {
  console.log("\nACTION REQUIRED — approve this signer in Warpcast:");
  console.log("  1. Open https://dev.neynar.com/ → same app as NEYNAR_API_KEY");
  console.log("  2. Signers → find this UUID → Approve / Connect Warpcast");
  console.log("  3. Scan QR in the Warpcast mobile app and confirm");
  console.log("  4. Re-run: npm run grove:signer-check");
  console.log("  5. npm run sync:deploy-env && npm run deploy:grove");
  process.exit(1);
}

console.log("\nUnexpected signer status. Check dev.neynar.com → Signers.");
process.exit(1);
