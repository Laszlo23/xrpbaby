/**
 * Print or write GET /.well-known/farcaster.json (Mini App manifest).
 *
 * Usage (from b3/app):
 *   npm run farcaster:manifest
 *   npm run farcaster:manifest -- --unsigned
 *   npm run farcaster:manifest -- --write public/.well-known/farcaster.json
 *   npm run farcaster:manifest -- --write-association-template data/farcaster-account-association.json
 *
 * Sign domain ownership:
 *   https://farcaster.xyz/~/developers/mini-apps/manifest
 *   Domain: app.buildingcultureid.space (or your PUBLIC_APP_ORIGIN host)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

const { buildFarcasterManifest, readFarcasterAccountAssociation } =
  await import("../src/server/farcaster-manifest.ts");

const args = process.argv.slice(2);
const unsigned = args.includes("--unsigned");
const writeIdx = args.indexOf("--write");
const writeAssociationIdx = args.indexOf("--write-association-template");
const outPath = writeIdx >= 0 ? args[writeIdx + 1] : null;
const associationPath =
  writeAssociationIdx >= 0
    ? (args[writeAssociationIdx + 1] ?? "data/farcaster-account-association.json")
    : "data/farcaster-account-association.json";

if (writeAssociationIdx >= 0) {
  const abs = resolve(process.cwd(), associationPath);
  mkdirSync(dirname(abs), { recursive: true });
  const template = {
    header: "PASTE_HEADER_FROM_WARPCAST",
    payload: "PASTE_PAYLOAD_FROM_WARPCAST",
    signature: "PASTE_SIGNATURE_FROM_WARPCAST",
    _instructions:
      "Sign at https://farcaster.xyz/~/developers/mini-apps/manifest for your app domain, then paste the three values here and run: npm run farcaster:manifest:deploy",
  };
  writeFileSync(abs, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  console.error(`Wrote association template ${abs}`);
  process.exit(0);
}

const json = JSON.stringify(
  buildFarcasterManifest({ includeUnsignedAssociation: unsigned }),
  null,
  2,
);

if (outPath) {
  const abs = resolve(process.cwd(), outPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, `${json}\n`, "utf8");
  console.error(`Wrote ${abs}`);
}

console.log(json);

const association = readFarcasterAccountAssociation();
if (!association && !unsigned) {
  console.error("");
  console.error("Note: accountAssociation is missing. To verify domain ownership:");
  console.error(
    "  1. npm run farcaster:manifest -- --unsigned --write public/.well-known/farcaster.json",
  );
  console.error("  2. Open https://farcaster.xyz/~/developers/mini-apps/manifest");
  console.error("  3. npm run farcaster:manifest -- --write-association-template");
  console.error(
    "  4. Paste signed header/payload/signature, then npm run farcaster:manifest:deploy",
  );
}
