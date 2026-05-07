/**
 * Print the same JSON as GET /.well-known/farcaster.json (Mini App manifest).
 *
 * Loads optional `.env` from the frontend root so PUBLIC_APP_ORIGIN / FARCASTER_* apply.
 *
 * Usage (from b3/frontend):
 *   npx tsx scripts/generate-farcaster-manifest.ts
 *   npx tsx scripts/generate-farcaster-manifest.ts --write public/farcaster.json
 */
import { mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDotEnvOptional(): void {
  const envPath = resolve(__dirname, "../.env");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnvOptional();

const { buildFarcasterManifest } = await import("../src/server/farcaster-manifest.ts");

const args = process.argv.slice(2);
const writeIdx = args.indexOf("--write");
const outPath = writeIdx >= 0 ? args[writeIdx + 1] : null;

const json = JSON.stringify(buildFarcasterManifest(), null, 2);

if (outPath) {
  const abs = resolve(process.cwd(), outPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, `${json}\n`, "utf8");
  console.error(`Wrote ${abs}`);
}

console.log(json);
