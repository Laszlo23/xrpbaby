import {
  DEFAULT_IDENTITY_NETWORK_ID,
  getIdentityNetwork,
  getIdentityNetworkByChainId,
  isIdentityNetworkId,
  listIdentityNetworks,
  type IdentityNetworkId,
} from "@/lib/identity/networks";

export type { IdentityNetworkId, IdentityNetworkConfig } from "@/lib/identity/networks";
export {
  getIdentityNetwork,
  listIdentityNetworks,
  getIdentityNetworkByChainId,
  isIdentityNetworkId,
  DEFAULT_IDENTITY_NETWORK_ID,
};

/** @deprecated Prefer `getIdentityNetwork(activeId)` from CultureNetworkContext */
const defaultNet = getIdentityNetwork(DEFAULT_IDENTITY_NETWORK_ID);

export const identityChain = defaultNet.chain;
export const identityChainId = defaultNet.chainId;
export const identityChainLabel = defaultNet.chainLabel;
export const identityContractAddress = defaultNet.contractAddress;
export const isIdentityContractConfigured = defaultNet.isConfigured;

export function getIdentityConfigForNetwork(id: IdentityNetworkId) {
  const net = getIdentityNetwork(id);
  return {
    networkId: net.id,
    identityChain: net.chain,
    identityChainId: net.chainId,
    identityChainLabel: net.chainLabel,
    identityContractAddress: net.contractAddress,
    isIdentityContractConfigured: net.isConfigured,
    nativeSymbol: net.nativeSymbol,
    explorerAddressUrl: net.explorerAddressUrl,
  };
}

export {
  IDENTITY_MAINNET_ADDRESS,
  IDENTITY_BSC_MAINNET_ADDRESS,
  IDENTITY_MINT_PRICE_WEI_DEFAULT,
  IDENTITY_MINT_TARGET_USD,
  formatIdentityMintPrice,
  formatIdentityMintPriceNativeOnly,
  formatIdentityMintPriceEthOnly,
  identityMintPriceShort,
  identityMintPriceTagline,
} from "@/lib/identity/mint-price";
