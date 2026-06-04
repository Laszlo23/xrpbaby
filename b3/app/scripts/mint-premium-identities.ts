import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appDir = resolve(import.meta.dirname, "..");
config({ path: resolve(appDir, ".env") });

function resolveBaseRpc(): string {
  const fromEnv = process.env.VITE_BASE_RPC_URL?.trim();
  if (fromEnv && !fromEnv.includes("mainnet.base.org")) return fromEnv;
  const identityEnv = resolve(appDir, "../../apps/identity/.env");
  try {
    const key = readFileSync(identityEnv, "utf8")
      .match(/^ALCHEMY_API_KEY=(.+)/m)?.[1]
      ?.trim();
    if (key) return `https://base-mainnet.g.alchemy.com/v2/${key}`;
  } catch {
    /* ignore */
  }
  return "https://mainnet.base.org";
}

const BASE_RPC = resolveBaseRpc();
process.env.VITE_BASE_RPC_URL = BASE_RPC;

/**
 * Batch-mint premium Culture Layer names on Base (e.g. punk.culture).
 *
 *   cd app
 *   npx tsx scripts/mint-premium-identities.ts              # dry-run: availability + cost
 *   DRY_RUN=0 MINTER_PRIVATE_KEY=0x… npx tsx scripts/mint-premium-identities.ts
 *
 * Env:
 *   NAMES_FILE — newline list of full names (handle.tld), overrides built-in set
 *   HANDLES — comma handles to cross all TLDs (e.g. punk,vibe)
 *   TLDS — comma tlds (default: culture,build,home,eco,capital,city)
 *   MINTER_PRIVATE_KEY / PRIVATE_KEY — funded Base wallet (~0.00037 ETH + gas per mint)
 *   VITE_BASE_RPC_URL — optional RPC
 */
import { createPublicClient, createWalletClient, formatEther, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { cultureLayerIdentityAbi } from "../src/lib/identity/identityAbi";
import { TLD_LABELS, tldLabelToId } from "../src/lib/identity/tlds";
/** High-signal handles to secure across TLDs when still available. */
const PREMIUM_HANDLES = [
  "punk",
  "vibe",
  "culture",
  "build",
  "bcc",
  "bcd",
  "mint",
  "og",
  "ai",
  "dao",
  "zero",
  "forest",
  "vault",
  "chain",
  "art",
  "base",
  "web3",
  "nft",
  "pass",
  "city",
  "eco",
  "home",
  "capital",
  "builder",
  "building",
  "laszlo",
] as const;

type Target = { handle: string; tld: string; fullName: string };

function parseTargets(): Target[] {
  const namesFile = process.env.NAMES_FILE?.trim();
  if (namesFile) {
    const fs = require("node:fs") as typeof import("node:fs");
    const lines = fs
      .readFileSync(namesFile, "utf8")
      .split("\n")
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);
    return lines.map((fullName) => {
      const [handle, tldRaw] = fullName.split(".");
      return { handle, tld: `.${tldRaw}`, fullName };
    });
  }

  const handles = (process.env.HANDLES ?? PREMIUM_HANDLES.join(","))
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);
  const tlds = (process.env.TLDS ?? TLD_LABELS.join(","))
    .split(",")
    .map((t) => t.trim().replace(/^\./, ""))
    .filter(Boolean);

  const out: Target[] = [];
  for (const handle of handles) {
    for (const tldLabel of tlds) {
      out.push({
        handle,
        tld: `.${tldLabel}`,
        fullName: `${handle}.${tldLabel}`,
      });
    }
  }
  return out;
}

async function checkAvailable(fullName: string): Promise<string> {
  const origin = (process.env.VITE_APP_ORIGIN ?? "http://localhost:5173").replace(/\/$/, "");
  const res = await fetch(`${origin}/api/identity/resolve?name=${encodeURIComponent(fullName)}`);
  const j = (await res.json()) as { status?: string };
  return j.status ?? "unknown";
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const targets = parseTargets();
  const available: Target[] = [];

  console.log(`Checking ${targets.length} names (RPC ${BASE_RPC.slice(0, 48)}…)…\n`);
  for (const t of targets) {
    const status = await checkAvailable(t.fullName);
    if (status === "available") {
      available.push(t);
      console.log(`  ✓ available  ${t.fullName}`);
    } else {
      console.log(`  · ${status.padEnd(10)} ${t.fullName}`);
    }
    await sleep(120);
  }

  if (available.length === 0) {
    console.log("\nNo available names in this set.");
    return;
  }

  const rpc = BASE_RPC;
  const contract = process.env.VITE_IDENTITY_CONTRACT_ADDRESS?.trim() as Address | undefined;
  if (!contract || !/^0x[a-fA-F0-9]{40}$/.test(contract)) {
    console.error("Set VITE_IDENTITY_CONTRACT_ADDRESS in app/.env");
    process.exit(1);
  }

  const publicClient = createPublicClient({ chain: base, transport: http(rpc) });
  const mintPrice = await publicClient.readContract({
    address: contract,
    abi: cultureLayerIdentityAbi,
    functionName: "mintPrice",
  });
  const priceEth = formatEther(mintPrice);
  const totalWei = mintPrice * BigInt(available.length);
  console.log(
    `\n${available.length} mints × ${priceEth} ETH ≈ ${formatEther(totalWei)} ETH (+ gas)`,
  );

  if (process.env.DRY_RUN !== "0") {
    console.log("\nDry-run. To mint:");
    console.log("  DRY_RUN=0 MINTER_PRIVATE_KEY=0x… npx tsx scripts/mint-premium-identities.ts");
    console.log("\nOr one name:");
    console.log(`  DRY_RUN=0 HANDLE=punk TLD=.culture npx tsx scripts/sample-identity-mint.ts`);
    return;
  }

  const pk = process.env.MINTER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  if (!pk?.startsWith("0x")) {
    console.error("Missing MINTER_PRIVATE_KEY");
    process.exit(1);
  }

  const account = privateKeyToAccount(pk as `0x${string}`);
  const balance = await publicClient.getBalance({ address: account.address });
  if (balance < totalWei) {
    console.error(
      `\nInsufficient ETH on ${account.address}: have ${formatEther(balance)}, need ~${formatEther(totalWei)} for mint fees`,
    );
    process.exit(1);
  }

  const wallet = createWalletClient({ account, chain: base, transport: http(rpc) });
  const minted: string[] = [];

  for (const t of available) {
    const tldId = tldLabelToId(t.tld);
    if (tldId === null) continue;
    console.log(`\nMinting ${t.fullName}…`);
    const hash = await wallet.writeContract({
      address: contract,
      abi: cultureLayerIdentityAbi,
      functionName: "mint",
      args: [t.handle, tldId],
      value: mintPrice,
    });
    console.log(`  tx ${hash}`);
    console.log(`  https://basescan.org/tx/${hash}`);
    const origin = (process.env.VITE_APP_ORIGIN ?? "http://localhost:5173").replace(/\/$/, "");
    console.log(`  profile ${origin}/id/${encodeURIComponent(t.fullName)}`);
    console.log(`  gateway ${origin}/n/${encodeURIComponent(t.fullName)}`);
    minted.push(t.fullName);
    await sleep(1500);
  }

  console.log(`\nDone. Minted ${minted.length}: ${minted.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
