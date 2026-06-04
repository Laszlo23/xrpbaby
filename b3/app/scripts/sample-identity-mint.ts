/**
 * Sample Culture Layer identity mint — dry-run or on-chain mint on Base.
 *
 * Dry-run (default): prints calldata from GET /api/market/sample-mint
 * Live mint: set MINTER_PRIVATE_KEY (or PRIVATE_KEY) + optional HANDLE / TLD
 *
 *   cd app
 *   npx tsx scripts/sample-identity-mint.ts
 *   DRY_RUN=0 MINTER_PRIVATE_KEY=0x… HANDLE=mydemo npx tsx scripts/sample-identity-mint.ts
 */
import { createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { cultureLayerIdentityAbi } from "../src/lib/identity/identityAbi";
import { tldLabelToId } from "../src/lib/identity/tlds";

const origin = (process.env.VITE_APP_ORIGIN ?? "http://localhost:5173").replace(/\/$/, "");

async function fetchSampleMint(handle: string, tld: string) {
  const qs = new URLSearchParams({ handle, tld });
  const res = await fetch(`${origin}/api/market/sample-mint?${qs}`);
  const body = (await res.json()) as {
    ok?: boolean;
    status?: string;
    fullName?: string;
    transaction?: { to: string; data: string; value: string; chainId: number };
    mintPriceEth?: string;
    note?: string;
  };
  return { status: res.status, body };
}

async function main() {
  const handle = (process.env.HANDLE ?? process.env.SAMPLE_MINT_HANDLE ?? "buildchain-demo")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const tld = process.env.TLD ?? ".culture";
  const tldId = tldLabelToId(tld);
  if (tldId === null) {
    console.error("Invalid TLD:", tld);
    process.exit(1);
  }

  const { status, body } = await fetchSampleMint(handle, tld);
  console.log("API status:", status);
  console.log(JSON.stringify(body, null, 2));

  if (process.env.DRY_RUN !== "0") {
    console.log("\nDry-run only. Set DRY_RUN=0 and MINTER_PRIVATE_KEY to broadcast.");
    return;
  }

  const pk = process.env.MINTER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  if (!pk?.startsWith("0x")) {
    console.error("Missing MINTER_PRIVATE_KEY for live mint");
    process.exit(1);
  }
  if (!body.ok || !body.transaction) {
    console.error("Name not available or contract not configured:", body.status, body.note);
    process.exit(1);
  }

  const rpc = process.env.VITE_BASE_RPC_URL?.trim() || "https://mainnet.base.org";
  const account = privateKeyToAccount(pk as `0x${string}`);
  const wallet = createWalletClient({
    account,
    chain: base,
    transport: http(rpc),
  });

  const tx = body.transaction;
  const hash = await wallet.sendTransaction({
    to: tx.to as Address,
    data: tx.data as `0x${string}`,
    value: BigInt(tx.value),
    chain: base,
  });

  console.log("\nMint submitted:", hash);
  console.log("Explorer: https://basescan.org/tx/" + hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
