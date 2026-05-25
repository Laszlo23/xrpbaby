import type { Address } from "viem";

export type CultureNameStatus = "invalid" | "available" | "claimed" | "unconfigured";

export type ResolvedCultureName = {
  ok: true;
  configured: boolean;
  status: CultureNameStatus;
  fullName: string;
  handle?: string;
  tld?: string;
  owner?: Address;
  tokenId?: string;
  isFounding?: boolean;
  mintedAt?: string;
  profilePath?: string;
  gatewayPath?: string;
  chainId?: number;
  contractAddress?: string;
};
