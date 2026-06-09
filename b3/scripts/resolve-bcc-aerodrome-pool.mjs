#!/usr/bin/env node
/**
 * Resolve BCC Aerodrome pool from DexScreener and print (or apply) env vars.
 * Usage:
 *   node scripts/resolve-bcc-aerodrome-pool.mjs
 *   node scripts/resolve-bcc-aerodrome-pool.mjs --write
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BCC = "0xb890a5289f789f1346032ccc1847939e855fab07";
const DEX_URL = `https://api.dexscreener.com/latest/dex/tokens/${BCC}`;

const WRITE = process.argv.includes("--write");

function setKv(file, key, val) {
  if (!existsSync(file)) return;
  const raw = readFileSync(file, "utf8");
  const line = `${key}=${val}`;
  const re = new RegExp(`^#? ?${key}=.*$`, "m");
  const next = re.test(raw)
    ? raw.replace(re, line)
    : `${raw.trimEnd()}\n${line}\n`;
  writeFileSync(file, next);
}

async function main() {
  const res = await fetch(DEX_URL, { headers: { accept: "application/json" } });
  if (!res.ok) {
    console.error("DexScreener fetch failed", res.status);
    process.exit(1);
  }
  const data = await res.json();
  const pairs = data.pairs ?? [];
  const uni = pairs
    .filter((p) => (p.dexId ?? "").toLowerCase().includes("uniswap"))
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
  const aero = pairs
    .filter((p) => (p.dexId ?? "").toLowerCase().includes("aerodrome"))
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

  const env = {
    VITE_BCC_AERODROME_ENABLED: "1",
    VITE_BCC_UNISWAP_POOL: uni?.pairAddress ?? "",
    VITE_BCC_AERODROME_POOL: aero?.pairAddress ?? "",
    VITE_BCC_AERODROME_LP_TOKEN: aero?.pairAddress ?? "",
    VITE_BCC_AERODROME_GAUGE: "",
  };

  console.log("# BCC liquidity — resolved", new Date().toISOString());
  console.log(`# Uniswap pairs: ${pairs.filter((p) => (p.dexId ?? "").includes("uni")).length}`);
  console.log(`# Aerodrome pairs: ${pairs.filter((p) => (p.dexId ?? "").includes("aero")).length}`);
  if (uni) {
    console.log(`# Uniswap TVL ~$${Math.round(uni.liquidity?.usd ?? 0).toLocaleString()}`);
  }
  if (aero) {
    console.log(`# Aerodrome TVL ~$${Math.round(aero.liquidity?.usd ?? 0).toLocaleString()}`);
  }
  console.log("");
  for (const [k, v] of Object.entries(env)) {
    if (v) console.log(`${k}=${v}`);
    else console.log(`# ${k}=  # set manually after gauge is created on Aerodrome`);
  }

  if (!aero) {
    console.log("\n# No Aerodrome pool listed yet.");
    console.log(
      "# Next: open https://aerodrome.finance/deposit?token0=0xB890a5289F789f1346032Ccc1847939e855FAb07&token1=0x4200000000000000000000000000000000000006&chain=base",
    );
    console.log("# Seed BCC + WETH from treasury, then re-run this script.");
  }

  if (WRITE) {
    const deploy = resolve(ROOT, "deploy/.env");
    const app = resolve(ROOT, "app/.env");
    for (const [k, v] of Object.entries(env)) {
      if (v) {
        setKv(deploy, k, v);
        setKv(app, k, v);
      }
    }
    console.log("\nWrote to deploy/.env and app/.env (non-empty values only).");
    console.log("Run: npm run sync:vite-env");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
