import type { Address } from "viem";

export type WalletPrincipal = {
  address: Address;
  chainId: number;
  fid?: number;
};
