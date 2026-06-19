/* eslint-disable -- generated */
export const deploymentAddresses56 = {

} as const;

export const deploymentAddresses8453 = {
  "BuildingCultureDollar": "0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72" as const,
  "BCDGenesisClaim": "0x2bae6b04d0d1c8016cc863509395b68eb0021f58" as const,
  "RaffleTicketCampaign": "0xb1a88bf677400c23430b643a07229af832130ad8" as const,
  "AgentShareCampaign": "0x130e320a386b1ff0228492ddd65c380131ba86e9" as const,
  "CulturePulseAnchor": "0x503f8ad17c0fcdd84fbdbf7f51b41b39b02ebbae" as const,
  "GenesisVaultPassPhase0": "0x39952f562279f8a6517ed9d36a1ff9d495e4e38d" as const,
  "GenesisVaultPassPhase1": "0x0fe8ae7f7207f8c04377cdd4a711a67811cf3a73" as const,
  "GenesisVaultPassPhase2": "0x01b971794c4c5c265bc0326de329e1f4c937c765" as const,
  "CulturePassBccRewards": "0xaae3eb068026cab39a841c2628f983c559ad6c10" as const,
  "PanicSwitchAttestation": "0x3f60465e70042b52e3fe95fec8e80680b6830b6a" as const,
  "CultureChronicles1155": "0x667a11c6e05e37652e57a962059310384e71258a" as const,
  "BccRootsStaking": "0x42355c509743a92ebd6f2f7259d4f677eca18b4d" as const,
  "MockBccUsdOracle": "0x46c96e0a459ea441873fa8c3077f42b5e1e9cb4f" as const,
  "CultureLayerIdentityV2": "0x9942095ab0a9512e432aeacd623e929cfb474058" as const,
  "BuildingCultureHubV2": "0x97fdaeafdbef34918cfd223549c3d1e98e95c7c3" as const,
  "BuildingCultureTicketV2": "0x4f92e47ab0f6f233ffe76b2c3ddbf2729719c8d6" as const,
} as const;

export const deploymentAddresses84532 = {
  "BuildingCultureDollar": "0x11c57fd49daf5f3b3e89c9c6d7c06849957fe552" as const,
  "BCDGenesisClaim": "0x7192b8d144ac6904ed3b9a381011b4af7e58b2cb" as const,
  "CulturePulseAnchor": "0x64f0009581a7007cc31040664e5d2d635f6a84fd" as const,
  "BccRootsStaking": "0x5b73c5498c1e3b4dba84de0f1833c4a029d90519" as const,
  "BcidRegistry": "0xa901817e46f98d52eb3643a365f4d9c33a19092c" as const,
  "BcidSoulboundCredential": "0xc01667959e0f7b4c34f909140eb46bcd80c95075" as const,
} as const;

export type DeploymentContractName =
  | keyof typeof deploymentAddresses56
  | keyof typeof deploymentAddresses8453
  | keyof typeof deploymentAddresses84532;

export function getDeploymentAddress(
  name: DeploymentContractName,
  chain: number,
): `0x${string}` | undefined {
  if (chain === 56 && name in deploymentAddresses56) {
    return deploymentAddresses56[name as keyof typeof deploymentAddresses56];
  }
  if (chain === 8453 && name in deploymentAddresses8453) {
    return deploymentAddresses8453[name as keyof typeof deploymentAddresses8453];
  }
  if (chain === 84532 && name in deploymentAddresses84532) {
    return deploymentAddresses84532[name as keyof typeof deploymentAddresses84532];
  }
  return undefined;
}
