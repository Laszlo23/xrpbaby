#!/usr/bin/env node
/**
 * Resolve BCC Balancer pool from DexScreener and print (or apply) env vars.
 * Usage:
 *   node scripts/resolve-bcc-balancer-pool.mjs
 *   node scripts/resolve-bcc-balancer-pool.mjs --write
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BCC = "0xb890a5289f789f1346032ccc1847939e855fab07";
const DEX_URL = `https://api.dexscreener.com/latest/dex/tokens/${BCC}`;
const DEPLOYMENTS = resolve(ROOT, "contracts/deployments/bcc-8453.json");

const WRITE = process.argv.includes("--write");

function setKv(file, key, val) {
  if (!existsSync(file)) return;
  const raw = readFileSync(file, "utf8");
  const line = `${key}=${val}`;
  const re = new RegExp(`^#? ?${key}=.*$`, "m");
  const next = re.test(raw) ? raw.replace(re, line) : `${raw.trimEnd()}\n${line}\n`;
  writeFileSync(file, next);
}

function updateDeployments(balancer) {
  if (!existsSync(DEPLOYMENTS)) return;
  const raw = JSON.parse(readFileSync(DEPLOYMENTS, "utf8"));
  raw.balancer = {
    ...raw.balancer,
    enabled: true,
    pool: balancer.pool,
    bpt: balancer.bpt,
    gauge: balancer.gauge,
    createPoolUrl: "https://app.balancer.fi/#/base/pools/create",
    updatedAt: new Date().toISOString(),
    note: balancer.pool
      ? "Resolved from DexScreener — confirm BPT + gauge manually"
      : "No Balancer listing yet — run npm run balancer:pool-checklist",
  };
  writeFileSync(DEPLOYMENTS, `${JSON.stringify(raw, null, 2)}\n`);
}

async function main() {
  const res = await fetch(DEX_URL, { headers: { accept: "application/json" } });
  if (!res.ok) {
    console.error("DexScreener fetch failed", res.status);
    process.exit(1);
  }
  const data = await res.json();
  const pairs = data.pairs ?? [];
  const bal = pairs
    .filter((p) => (p.dexId ?? "").toLowerCase().includes("balancer"))
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

  const pool = bal?.pairAddress ?? "";
  const env = {
    VITE_BCC_BALANCER_ENABLED: "1",
    VITE_BCC_BALANCER_POOL: pool,
    VITE_BCC_BALANCER_BPT: pool,
    VITE_BCC_BALANCER_GAUGE: "",
  };

  console.log("# BCC Balancer — resolved", new Date().toISOString());
  console.log(
    `# Balancer pairs: ${pairs.filter((p) => (p.dexId ?? "").includes("bal")).length}`,
  );
  if (bal) {
    console.log(`# Balancer TVL ~$${Math.round(bal.liquidity?.usd ?? 0).toLocaleString()}`);
    console.log(`# Pair: ${bal.baseToken?.symbol}/${bal.quoteToken?.symbol}`);
  }
  console.log("");
  for (const [k, v] of Object.entries(env)) {
    if (v) console.log(`${k}=${v}`);
    else console.log(`# ${k}=  # set manually after gauge is registered on Balancer`);
  }

  if (!bal) {
    console.log("\n# No Balancer pool listed on DexScreener yet.");
    console.log("# Next: npm run balancer:pool-checklist");
    console.log(
      "# Create 80/20 BCC/WETH pool: https://app.balancer.fi/#/base/pools/create",
    );
  } else {
    console.log("\n# Confirm BPT address in Balancer UI (may differ from pool address).");
    console.log("# Set VITE_BCC_BALANCER_BPT if BPT != pool address.");
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
    updateDeployments({ pool, bpt: pool, gauge: "" });
    console.log("\nWrote to deploy/.env and app/.env (non-empty values only).");
    console.log("Updated contracts/deployments/bcc-8453.json → balancer");
    console.log("Run: npm run sync:vite-env");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
