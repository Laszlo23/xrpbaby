import type { Address } from "viem";

import { cultureGatewayPath, cultureProfilePath } from "@/lib/identity/urls";
import { parseIdentityFullName, tldIdToLabel } from "@/lib/identity/tlds";
import { cultureLayerIdentityAbi } from "@/lib/identity/identityAbi";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import { getIdentityServerConfig } from "@/server/identity/config";
import { getIdentityPublicClient } from "@/server/identity/client";

export type { CultureNameStatus, ResolvedCultureName } from "@/lib/identity/resolve-types";

export async function resolveCultureName(input: string): Promise<ResolvedCultureName> {
  const raw = input.trim().toLowerCase();
  const parsed = parseIdentityFullName(raw);

  if (!parsed) {
    return {
      ok: true,
      configured: false,
      status: "invalid",
      fullName: raw,
    };
  }

  const fullName = `${parsed.handle}.${parsed.tld}`;
  const cfg = getIdentityServerConfig();

  if (!cfg.configured) {
    return {
      ok: true,
      configured: false,
      status: "unconfigured",
      fullName,
      handle: parsed.handle,
      tld: parsed.tld,
      profilePath: cultureProfilePath(fullName),
      gatewayPath: cultureGatewayPath(fullName),
    };
  }

  const client = getIdentityPublicClient();
  if (!client) {
    return {
      ok: true,
      configured: false,
      status: "unconfigured",
      fullName,
      handle: parsed.handle,
      tld: parsed.tld,
    };
  }

  const tokenId = await client.readContract({
    address: cfg.contractAddress,
    abi: cultureLayerIdentityAbi,
    functionName: "getTokenId",
    args: [parsed.handle, parsed.tldId],
  });

  if (tokenId === 0n) {
    return {
      ok: true,
      configured: true,
      status: "available",
      fullName,
      handle: parsed.handle,
      tld: parsed.tld,
      profilePath: cultureProfilePath(fullName),
      gatewayPath: cultureGatewayPath(fullName),
      chainId: cfg.chainId,
      contractAddress: cfg.contractAddress,
    };
  }

  const [owner, handle, tldId, mintedAt, isFounding] = await client.readContract({
    address: cfg.contractAddress,
    abi: cultureLayerIdentityAbi,
    functionName: "getIdentity",
    args: [tokenId],
  });

  const tld = tldIdToLabel(Number(tldId));
  if (!tld) {
    return { ok: true, configured: true, status: "invalid", fullName: raw };
  }

  return {
    ok: true,
    configured: true,
    status: "claimed",
    fullName: `${handle}.${tld}`,
    handle,
    tld,
    owner: owner as Address,
    tokenId: tokenId.toString(),
    isFounding,
    mintedAt: new Date(Number(mintedAt) * 1000).toISOString(),
    profilePath: cultureProfilePath(`${handle}.${tld}`),
    gatewayPath: cultureGatewayPath(`${handle}.${tld}`),
    chainId: cfg.chainId,
    contractAddress: cfg.contractAddress,
  };
}
