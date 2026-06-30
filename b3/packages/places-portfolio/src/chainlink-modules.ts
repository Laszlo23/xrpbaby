import type { ChainlinkModule } from "./types.js";

const BASE_EXPLORER = "https://basescan.org/address";

export const CHAINLINK_MODULES: ChainlinkModule[] = [
  {
    id: "ace",
    label: "Chainlink ACE Adapter",
    address: "0x6BC4E810a5999Ba76bCcCdcc74D10CcFA0d9a72d",
    explorerBase: BASE_EXPLORER,
  },
  {
    id: "por",
    label: "Property Reserve Feed (PoR)",
    address: "0x89B34Ad6063ed0da2D563edBA98783DFbE69a19A",
    explorerBase: BASE_EXPLORER,
  },
  {
    id: "nav",
    label: "Chainlink Price Oracle",
    address: "0xCCBe9d1Dc1472095E557f2622A2a6235BDe446Fc",
    explorerBase: BASE_EXPLORER,
  },
  {
    id: "registry",
    label: "Compliance Registry",
    address: "0xa655c0B0037699433F0692356a3A142956103B7a",
    explorerBase: BASE_EXPLORER,
  },
];

export function reocMetadataUrl(appOrigin: string, propertyId: number): string {
  const base = appOrigin.replace(/\/$/, "");
  return `${base}/places/api/reoc/${propertyId}`;
}

export function basescanAddress(explorerBase: string, address: string): string {
  return `${explorerBase}/${address}`;
}
