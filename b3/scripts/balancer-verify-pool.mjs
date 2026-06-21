#!/usr/bin/env node
/**
 * Verify Balancer pool / BPT / gauge addresses on Base via RPC.
 * Usage:
 *   npm run balancer:verify -- --pool 0x... --bpt 0x... [--gauge 0x...]
 */
import { createPublicClient, erc20Abi, http, isAddress } from "viem";
import { base } from "viem/chains";

const args = process.argv.slice(2);
function arg(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

const pool = arg("pool");
const bpt = arg("bpt");
const gauge = arg("gauge");
const rpc = process.env.BASE_RPC_URL?.trim() || "https://mainnet.base.org";

async function main() {
  if (!pool || !bpt || !isAddress(pool) || !isAddress(bpt)) {
    console.error("Usage: npm run balancer:verify -- --pool 0x... --bpt 0x... [--gauge 0x...]");
    process.exit(1);
  }

  const client = createPublicClient({ chain: base, transport: http(rpc) });

  const [poolCode, bptCode, bptSymbol, gaugeCode] = await Promise.all([
    client.getBytecode({ address: pool }),
    client.getBytecode({ address: bpt }),
    client.readContract({ address: bpt, abi: erc20Abi, functionName: "symbol" }).catch(() => null),
    gauge && isAddress(gauge)
      ? client.getBytecode({ address: gauge })
      : Promise.resolve(undefined),
  ]);

  console.log("# Balancer verify — Base");
  console.log(`pool ${pool}: ${poolCode && poolCode !== "0x" ? "OK (contract)" : "MISSING"}`);
  console.log(`bpt  ${bpt}: ${bptCode && bptCode !== "0x" ? "OK (contract)" : "MISSING"}${bptSymbol ? ` symbol=${bptSymbol}` : ""}`);
  if (gauge) {
    console.log(
      `gauge ${gauge}: ${gaugeCode && gaugeCode !== "0x" ? "OK (contract)" : "MISSING"}`,
    );
  } else {
    console.log("gauge: not provided — set after registration");
  }

  const ok = poolCode && poolCode !== "0x" && bptCode && bptCode !== "0x";
  if (ok) {
    console.log("\nNext: npm run balancer:resolve -- --write && npm run sync:vite-env");
  } else {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
