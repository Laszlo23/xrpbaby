#!/usr/bin/env node
/**
 * Daily Culture Pulse on-chain attestation.
 * Usage: node scripts/pulse-daily-attest.mjs
 */
import { config } from "dotenv";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createWalletClient,
  http,
  keccak256,
  toBytes,
  encodeFunctionData,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, "app/.env") });

const chainId = Number(process.env.PULSE_ATTEST_CHAIN_ID ?? "8453");
const chain = chainId === 84532 ? baseSepolia : base;
const rpc =
  chainId === 84532
    ? process.env.BASE_SEPOLIA_RPC_URL
    : process.env.BASE_MAINNET_RPC_URL ?? process.env.VITE_BASE_RPC_URL;

const anchor = process.env.PULSE_ANCHOR_ADDRESS?.trim();
const pk =
  process.env.PULSE_ATTEST_PRIVATE_KEY?.trim() ??
  process.env.PRIVATE_KEY?.trim();
const origin = (
  process.env.PUBLIC_APP_ORIGIN ??
  process.env.VITE_PLATFORM_ORIGIN ??
  "http://localhost:5173"
).replace(/\/$/, "");

if (!anchor || !/^0x[a-fA-F0-9]{40}$/.test(anchor)) {
  console.error("Set PULSE_ANCHOR_ADDRESS");
  process.exit(1);
}
if (!pk || !/^0x[a-fA-F0-9]{64}$/.test(pk)) {
  console.error("Set PULSE_ATTEST_PRIVATE_KEY or PRIVATE_KEY");
  process.exit(1);
}
if (!rpc) {
  console.error("Set RPC URL for chain", chainId);
  process.exit(1);
}

const dayId = new Date().toISOString().slice(0, 10);
const dayIdUint = BigInt(dayId.replace(/-/g, ""));

const { PrismaClient } = await import("@prisma/client");
const { buildDailyDigestPayload } = await import(
  "../app/src/server/pulse/ingest.ts"
);
const { canonicalJson, digestHex } = await import(
  "../app/src/server/pulse/digest.ts"
);

const prisma = new PrismaClient();
try {
  const existing = await prisma.pulseAttestation.findUnique({
    where: { dayId },
  });
  if (existing) {
    console.log("Already attested for", dayId, existing.txHash);
    process.exit(0);
  }

  const payload = await buildDailyDigestPayload(prisma, dayId);
  const digestStr = digestHex(payload);
  const digestBytes = `0x${digestStr}`;

  const metadataUri = `${origin}/api/pulse/digest/${dayId}`;
  const account = privateKeyToAccount(pk);
  const client = createWalletClient({
    account,
    chain,
    transport: http(rpc),
  });

  const abi = [
    {
      type: "function",
      name: "attestDay",
      inputs: [
        { name: "dayId", type: "uint256" },
        { name: "digest", type: "bytes32" },
        { name: "metadataUri", type: "string" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ];

  const data = encodeFunctionData({
    abi,
    functionName: "attestDay",
    args: [dayIdUint, digestBytes, metadataUri],
  });

  const hash = await client.sendTransaction({
    to: anchor,
    data,
  });

  console.log("Submitted attestDay tx:", hash);

  await prisma.pulseAttestation.create({
    data: {
      dayId,
      digest: digestStr,
      metadataUri,
      chainId,
      txHash: hash,
    },
  });

  await prisma.growthSnapshot.create({
    data: {
      memberCount: payload.snapshot?.memberCount ?? 0,
      waitlistCount: payload.snapshot?.waitlistCount ?? 0,
      culturePoints: payload.snapshot?.culturePoints ?? 0,
      activity24h: payload.snapshot?.activity24h ?? 0,
      farcasterItems: payload.snapshot?.farcasterItems ?? 0,
      xItems: payload.snapshot?.xItems ?? 0,
      facebookItems: payload.snapshot?.facebookItems ?? 0,
      tiktokItems: payload.snapshot?.tiktokItems ?? 0,
      instagramItems: payload.snapshot?.instagramItems ?? 0,
      nativeComments: payload.snapshot?.nativeComments ?? 0,
      digest: digestStr,
    },
  });
} finally {
  await prisma.$disconnect();
}
