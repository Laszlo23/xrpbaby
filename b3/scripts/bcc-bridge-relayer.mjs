#!/usr/bin/env node
/**
 * BCC bridge relayer — watches Base vault Locked events and mints wBCC on BSC;
 * watches wBCC BridgeBurned events and unlocks BCC on Base.
 *
 * Usage:
 *   node scripts/bcc-bridge-relayer.mjs
 *
 * Env: BRIDGE_RELAYER_PRIVATE_KEY, BASE_RPC_URL, BSC_RPC_URL,
 *      BCC_BRIDGE_VAULT, WBCC_ADDRESS, BSC_CHAIN_ID=56, BASE_CHAIN_ID=8453
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbiItem,
  decodeEventLog,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, bsc } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

config({ path: resolve(ROOT, "contracts/.env") });
config({ path: resolve(ROOT, "deploy/.env") });

const pk = process.env.BRIDGE_RELAYER_PRIVATE_KEY?.trim() || process.env.PRIVATE_KEY?.trim();
const vault = process.env.BCC_BRIDGE_VAULT?.trim();
const wbcc = process.env.WBCC_ADDRESS?.trim();
const baseRpc = process.env.BASE_RPC_URL?.trim() || "https://mainnet.base.org";
const bscRpc = process.env.BSC_RPC_URL?.trim() || "https://bsc-dataseed.binance.org";
const bscChainId = Number(process.env.BSC_CHAIN_ID ?? "56");
const pollMs = Number(process.env.BRIDGE_RELAYER_POLL_MS ?? "15000");

if (!pk || !/^0x[a-fA-F0-9]{64}$/.test(pk)) {
  console.error("Set BRIDGE_RELAYER_PRIVATE_KEY or PRIVATE_KEY");
  process.exit(1);
}
if (!vault || !wbcc) {
  console.error("Set BCC_BRIDGE_VAULT and WBCC_ADDRESS");
  process.exit(1);
}

const account = privateKeyToAccount(pk);
const baseClient = createPublicClient({ chain: base, transport: http(baseRpc) });
const bscClient = createPublicClient({ chain: bsc, transport: http(bscRpc) });
const baseWallet = createWalletClient({ account, chain: base, transport: http(baseRpc) });
const bscWallet = createWalletClient({ account, chain: bsc, transport: http(bscRpc) });

const vaultAbi = [
  {
    name: "registerBurn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "srcChainId", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "unlock",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "srcChainId", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const wbccAbi = [
  {
    name: "bridgeMint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const lockedEvent = parseAbiItem(
  "event Locked(address indexed from, address indexed to, uint256 amount, uint256 indexed dstChainId, uint256 nonce)",
);
const burnedEvent = parseAbiItem(
  "event BridgeBurned(address indexed from, uint256 amount, uint256 dstChainId, uint256 nonce)",
);

const processedLocks = new Set();
const processedBurns = new Set();

let lastBaseBlock = 0n;
let lastBscBlock = 0n;

async function handleLock(log) {
  const key = `lock-${log.transactionHash}-${log.logIndex}`;
  if (processedLocks.has(key)) return;
  processedLocks.add(key);

  const { args } = decodeEventLog({ abi: [lockedEvent], data: log.data, topics: log.topics });
  const to = args.to;
  const amount = args.amount;
  const nonce = args.nonce;

  console.log(`Lock detected nonce=${nonce} amount=${amount} to=${to}`);
  const hash = await bscWallet.writeContract({
    address: wbcc,
    abi: wbccAbi,
    functionName: "bridgeMint",
    args: [to, amount, nonce],
  });
  console.log(`  minted wBCC tx=${hash}`);
}

async function handleBurn(log) {
  const key = `burn-${log.transactionHash}-${log.logIndex}`;
  if (processedBurns.has(key)) return;
  processedBurns.add(key);

  const { args } = decodeEventLog({ abi: [burnedEvent], data: log.data, topics: log.topics });
  const from = args.from;
  const amount = args.amount;
  const nonce = args.nonce;

  console.log(`Burn detected nonce=${nonce} amount=${amount} from=${from}`);
  await baseWallet.writeContract({
    address: vault,
    abi: vaultAbi,
    functionName: "registerBurn",
    args: [from, amount, BigInt(bscChainId), nonce],
  });
  const hash = await baseWallet.writeContract({
    address: vault,
    abi: vaultAbi,
    functionName: "unlock",
    args: [from, amount, BigInt(bscChainId), nonce],
  });
  console.log(`  unlocked BCC tx=${hash}`);
}

async function poll() {
  const baseBlock = await baseClient.getBlockNumber();
  const bscBlock = await bscClient.getBlockNumber();

  if (lastBaseBlock === 0n) lastBaseBlock = baseBlock - 5n;
  if (lastBscBlock === 0n) lastBscBlock = bscBlock - 5n;

  const lockLogs = await baseClient.getLogs({
    address: vault,
    event: lockedEvent,
    fromBlock: lastBaseBlock + 1n,
    toBlock: baseBlock,
  });
  for (const log of lockLogs) await handleLock(log);

  const burnLogs = await bscClient.getLogs({
    address: wbcc,
    event: burnedEvent,
    fromBlock: lastBscBlock + 1n,
    toBlock: bscBlock,
  });
  for (const log of burnLogs) await handleBurn(log);

  lastBaseBlock = baseBlock;
  lastBscBlock = bscBlock;
}

console.log("BCC bridge relayer started");
console.log("  vault:", vault);
console.log("  wBCC:", wbcc);
console.log("  relayer:", account.address);

while (true) {
  try {
    await poll();
  } catch (err) {
    console.error("poll error:", err instanceof Error ? err.message : err);
  }
  await new Promise((r) => setTimeout(r, pollMs));
}
