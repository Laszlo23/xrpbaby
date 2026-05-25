import { loadAppEnv } from "./load-env";

loadAppEnv();

import { getPrisma } from "@/server/db/prisma";
import {
  pulseAnchorAddress,
  pulseAttestChainId,
  pulseAttestPrivateKey,
  pulsePublicOrigin,
} from "@/server/pulse/config";
import { dayIdToUint, dayIdUtc, digestHex } from "@/server/pulse/digest";
import { buildDailyDigestPayload } from "@/server/pulse/ingest";
import { createWalletClient, encodeFunctionData, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error("DATABASE_URL not configured");
    process.exit(1);
  }

  const anchor = pulseAnchorAddress();
  const pk = pulseAttestPrivateKey();
  const chainId = pulseAttestChainId();
  const chain = chainId === 84532 ? baseSepolia : base;
  const rpc =
    chainId === 84532
      ? process.env.BASE_SEPOLIA_RPC_URL
      : process.env.BASE_MAINNET_RPC_URL ?? process.env.VITE_BASE_RPC_URL;

  if (!anchor || !pk || !rpc) {
    console.error("Set PULSE_ANCHOR_ADDRESS, PRIVATE_KEY, and RPC URL");
    process.exit(1);
  }

  const dayId = dayIdUtc();
  const existing = await prisma.pulseAttestation.findUnique({ where: { dayId } });
  if (existing?.chainId === chainId) {
    console.log("Already attested:", dayId, existing.txHash);
    return;
  }
  if (existing && existing.chainId !== chainId) {
    console.log(
      `Re-attesting ${dayId} on chain ${chainId} (was ${existing.chainId})`,
    );
    await prisma.pulseAttestation.delete({ where: { dayId } });
  }

  const payload = await buildDailyDigestPayload(prisma, dayId);
  const digestStr = digestHex(payload);
  const digestBytes = `0x${digestStr}` as `0x${string}`;
  const metadataUri = `${pulsePublicOrigin()}/api/pulse/digest/${dayId}`;

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
  ] as const;

  const hash = await client.sendTransaction({
    to: anchor,
    data: encodeFunctionData({
      abi,
      functionName: "attestDay",
      args: [dayIdToUint(dayId), digestBytes, metadataUri],
    }),
  });

  console.log("attestDay tx:", hash);

  await prisma.pulseAttestation.create({
    data: {
      dayId,
      digest: digestStr,
      metadataUri,
      chainId,
      txHash: hash,
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
