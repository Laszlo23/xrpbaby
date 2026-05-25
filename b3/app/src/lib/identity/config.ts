import { base, baseSepolia } from "viem/chains";

const chainId = Number(
  import.meta.env.VITE_IDENTITY_CHAIN_ID ??
    import.meta.env.VITE_EVM_CHAIN_ID ??
    "8453",
);

export const identityChain = chainId === base.id ? base : baseSepolia;

export const identityChainId = identityChain.id;

export const identityChainLabel =
  identityChain.id === base.id ? ("Base mainnet" as const) : ("Base Sepolia" as const);

export const identityContractAddress = (import.meta.env.VITE_IDENTITY_CONTRACT_ADDRESS ||
  "") as `0x${string}`;

export const isIdentityContractConfigured =
  identityContractAddress.length === 42 && identityContractAddress.startsWith("0x");

export {
  IDENTITY_MAINNET_ADDRESS,
  IDENTITY_MINT_PRICE_WEI_DEFAULT,
  IDENTITY_MINT_TARGET_USD,
  formatIdentityMintPrice,
  formatIdentityMintPriceEthOnly,
  identityMintPriceShort,
  identityMintPriceTagline,
} from "@/lib/identity/mint-price";
