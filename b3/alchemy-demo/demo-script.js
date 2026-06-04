#!/usr/bin/env node
/**
 * Alchemy CLI demo — Solana + Base EVM using the Agent Wallet session.
 *
 * Prereqs:
 *   npm i -g @alchemy/cli@latest
 *   alchemy auth login -y
 *   alchemy app select <your-app-id>
 *   alchemy wallet connect --mode session --instance-name b3-cursor
 *
 * Usage:
 *   node demo-script.js           # Solana + EVM read-only checks
 *   node demo-script.js --solana  # Solana only
 *   node demo-script.js --evm     # Base EVM only
 *   node demo-script.js --devnet  # Solana devnet balance + optional airdrop hint
 */

import { spawnSync } from "node:child_process";
import { AGENT_WALLET, NETWORKS } from "./config.js";

const args = new Set(process.argv.slice(2));
const runSolana = args.has("--solana") || args.size === 0 || args.has("--devnet");
const runEvm = args.has("--evm") || args.size === 0;
const devnet = args.has("--devnet");

function alchemy(argv) {
  const result = spawnSync("alchemy", ["--json", "--no-interactive", ...argv], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  const stdout = (result.stdout ?? "").trim();
  const stderr = (result.stderr ?? "").trim();
  if (result.status !== 0) {
    let err;
    try {
      err = JSON.parse(stderr || stdout);
    } catch {
      err = { message: stderr || stdout || result.error?.message || "alchemy failed" };
    }
    throw new Error(err.error?.message ?? err.message ?? "alchemy command failed");
  }
  if (!stdout) return null;
  try {
    return JSON.parse(stdout);
  } catch {
    return stdout;
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

function lamportsToSol(lamports) {
  return (Number(lamports) / 1e9).toFixed(9);
}

function weiToEth(wei) {
  return (Number(BigInt(wei)) / 1e18).toFixed(6);
}

function main() {
  section("Alchemy CLI");
  const version = alchemy(["version"]);
  console.log("CLI version:", version?.version ?? version);

  const doctor = alchemy(["doctor"]);
  console.log("Doctor OK:", doctor?.ok === true);

  const wallet = alchemy(["wallet", "address"]);
  console.log("Configured session wallets:", wallet?.session ?? wallet);

  if (runSolana) {
    const net = devnet ? NETWORKS.solanaDevnet : NETWORKS.solana;
    section(`Solana (${net})`);
    console.log("Address:", AGENT_WALLET.solana);

    const balance = alchemy([
      "solana",
      "rpc",
      "getBalance",
      AGENT_WALLET.solana,
      "-n",
      net,
    ]);
    const lamports = balance?.value ?? 0;
    console.log("SOL balance:", lamportsToSol(lamports), `(${lamports} lamports)`);

    if (!devnet) {
      const dasParams = JSON.stringify({
        ownerAddress: AGENT_WALLET.solana,
        page: 1,
        limit: 5,
        displayOptions: { showFungible: true },
        sortBy: { sortBy: "created", sortDirection: "desc" },
      });
      const assets = alchemy([
        "solana",
        "das",
        "getAssetsByOwner",
        dasParams,
        "-n",
        NETWORKS.solana,
      ]);
      console.log("DAS assets (mainnet):", assets?.total ?? 0, "total");
      if (assets?.items?.length) {
        for (const item of assets.items) {
          console.log(" -", item.id ?? item.content?.metadata?.name ?? "asset");
        }
      }
    }

    if (Number(lamports) === 0) {
      console.log("\nFund this address on", net, "to send txs.");
      console.log("  alchemy wallet qr");
      if (devnet) {
        console.log(
          "  Devnet faucet (or): alchemy solana rpc requestAirdrop",
          AGENT_WALLET.solana,
          "1000000000 -n solana-devnet",
        );
      }
      console.log(
        "  Dry-run send: alchemy solana send <recipient> 0.01 --dry-run -n",
        net,
      );
    }
  }

  if (runEvm) {
    section(`EVM (${NETWORKS.evm})`);
    console.log("Address:", AGENT_WALLET.evm);

    const balance = alchemy([
      "evm",
      "data",
      "balance",
      AGENT_WALLET.evm,
      "-n",
      NETWORKS.evm,
    ]);
    console.log(
      "ETH balance:",
      balance?.balance ?? weiToEth(balance?.wei ?? "0"),
      balance?.symbol ?? "ETH",
    );

    if (Number(balance?.wei ?? 0) === 0) {
      console.log("\nFund with ETH on Base for evm send / contract calls.");
      console.log(
        "  alchemy evm data balance",
        AGENT_WALLET.evm,
        "-n",
        NETWORKS.evm,
      );
    }
  }

  if (runSolana || runEvm) {
    section("BCC multichain (platform API)");
    console.log("Solana buy routes: GET /api/market/bcc/solana-route?sol=1");
    console.log("Arbitrage scan: GET /api/trading/arbitrage-scan?sol_amount=1&eth_amount=0.01");
    console.log("Docs: docs/BCC_SOLANA_AND_ARBITRAGE.md");
  }

  section("Next steps");
  console.log("Reconnect wallet session before expiry:");
  console.log("  alchemy wallet connect --mode session --instance-name b3-cursor --force");
  console.log("Inventory:", "ops/AGENT_WALLET_INVENTORY.md");
}

try {
  main();
} catch (e) {
  console.error("\nError:", e.message);
  console.error(
    "\nFix: run `alchemy auth login -y` and `alchemy wallet connect --mode session`",
  );
  process.exit(1);
}
