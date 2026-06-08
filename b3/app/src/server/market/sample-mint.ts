import { encodeFunctionData, formatEther } from "viem";

import { cultureLayerIdentityAbi } from "@/lib/identity/identityAbi";
import { IDENTITY_MINT_TARGET_USD } from "@/lib/identity/mint-price";
import { tldLabelToId } from "@/lib/identity/tlds";
import { getServerPublicOrigin } from "@/lib/app-origin";
import { cultureGatewayPath, cultureProfilePath } from "@/lib/identity/urls";
import { resolveCultureName } from "@/server/identity/resolve";
import { getIdentityServerConfig } from "@/server/identity/config";
import { getIdentityPublicClient } from "@/server/identity/client";

export const SAMPLE_MINT_DEFAULT_HANDLE = "buildchain-demo";
export const SAMPLE_MINT_DEFAULT_TLD = ".culture";

export type SampleMintPayload = {
  ok: boolean;
  sku: string;
  kind: "culture_layer_identity";
  fullName: string;
  handle: string;
  tld: string;
  tldId: number;
  status: string;
  configured: boolean;
  chainId?: number;
  contractAddress?: string;
  mintPriceWei?: string;
  mintPriceEth?: string;
  targetUsd: number;
  metadata: {
    name: string;
    description: string;
    external_url: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
  transaction?: {
    to: string;
    data: string;
    value: string;
    chainId: number;
  };
  deeplinks: {
    pass: string;
    profile: string;
    gateway: string;
  };
  note: string;
};

function sanitizeHandle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 32);
}

export async function buildSampleMintPayload(opts: {
  handle?: string;
  tld?: string;
  wallet?: string;
}): Promise<SampleMintPayload> {
  const handle = sanitizeHandle(opts.handle?.trim() || SAMPLE_MINT_DEFAULT_HANDLE);
  const tld = opts.tld?.trim() || SAMPLE_MINT_DEFAULT_TLD;
  const tldId = tldLabelToId(tld);
  const origin = getServerPublicOrigin().replace(/\/$/, "");

  if (tldId === null) {
    return {
      ok: false,
      sku: "buildchain_sample_identity_mint_v1",
      kind: "culture_layer_identity",
      fullName: `${handle}.invalid`,
      handle,
      tld,
      tldId: -1,
      status: "invalid_tld",
      configured: false,
      targetUsd: IDENTITY_MINT_TARGET_USD,
      metadata: {
        name: "Invalid TLD",
        description: "Use a supported TLD: .culture, .build, .home, .eco, .capital, .city",
        external_url: `${origin}/pass`,
        attributes: [],
      },
      deeplinks: {
        pass: `${origin}/pass?name=${encodeURIComponent(handle)}&tld=${encodeURIComponent(tld)}`,
        profile: `${origin}/pass`,
        gateway: `${origin}/pass`,
      },
      note: "Invalid tld — see IDENTITY_TLD_OPTIONS",
    };
  }

  const fullName = `${handle}.${tld.replace(/^\./, "")}`;
  const resolved = await resolveCultureName(fullName, "base");
  const cfg = getIdentityServerConfig("base");

  const payloadBase: Omit<SampleMintPayload, "transaction" | "mintPriceWei" | "mintPriceEth"> = {
    ok: resolved.status === "available" && cfg.configured,
    sku: "buildchain_sample_identity_mint_v1",
    kind: "culture_layer_identity",
    fullName,
    handle,
    tld,
    tldId,
    status: resolved.status,
    configured: cfg.configured,
    chainId: cfg.configured ? cfg.chainId : undefined,
    contractAddress: cfg.configured ? cfg.contractAddress : undefined,
    targetUsd: IDENTITY_MINT_TARGET_USD,
    metadata: {
      name: `${fullName} — Culture Layer Identity`,
      description:
        "Sample ERC-721 identity on Base (~$1.11 USD in native ETH). Mint via wallet; this API returns unsigned calldata only.",
      external_url: `${origin}/pass?name=${encodeURIComponent(handle)}&tld=${encodeURIComponent(tld)}`,
      attributes: [
        { trait_type: "Handle", value: handle },
        { trait_type: "TLD", value: tld },
        { trait_type: "Network", value: "Base" },
        { trait_type: "Product", value: "Culture Layer Identity" },
      ],
    },
    deeplinks: {
      pass: `${origin}/pass?name=${encodeURIComponent(handle)}&tld=${encodeURIComponent(tld)}`,
      profile: `${origin}${cultureProfilePath(fullName)}`,
      gateway: `${origin}${cultureGatewayPath(fullName)}`,
    },
    note:
      resolved.status === "available"
        ? "Sign and send `transaction` from the renter wallet, or mint in the Pass UI."
        : `Name is ${resolved.status}. Pick another handle for a live sample mint.`,
  };

  if (!cfg.configured || resolved.status !== "available") {
    return payloadBase;
  }

  const client = getIdentityPublicClient("base");
  if (!client) {
    return { ...payloadBase, ok: false, note: "RPC client unavailable" };
  }

  const mintPriceWei = await client.readContract({
    address: cfg.contractAddress,
    abi: cultureLayerIdentityAbi,
    functionName: "mintPrice",
  });

  const data = encodeFunctionData({
    abi: cultureLayerIdentityAbi,
    functionName: "mint",
    args: [handle, tldId],
  });

  return {
    ...payloadBase,
    mintPriceWei: mintPriceWei.toString(),
    mintPriceEth: formatEther(mintPriceWei),
    transaction: {
      to: cfg.contractAddress,
      data,
      value: `0x${mintPriceWei.toString(16)}`,
      chainId: cfg.chainId,
    },
  };
}
