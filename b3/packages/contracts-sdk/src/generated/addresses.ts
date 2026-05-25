/* eslint-disable -- generated */
export const deploymentAddresses8453 = {
  "BuildingCultureDollar": "0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72" as const,
  "BCDGenesisClaim": "0x2bae6b04d0d1c8016cc863509395b68eb0021f58" as const,
  "RaffleTicketCampaign": "0xb1a88bf677400c23430b643a07229af832130ad8" as const,
  "AgentShareCampaign": "0x130e320a386b1ff0228492ddd65c380131ba86e9" as const,
  "CulturePulseAnchor": "0x503f8ad17c0fcdd84fbdbf7f51b41b39b02ebbae" as const,
} as const;

export const deploymentAddresses84532 = {
  "BuildingCultureDollar": "0x11c57fd49daf5f3b3e89c9c6d7c06849957fe552" as const,
  "BCDGenesisClaim": "0x7192b8d144ac6904ed3b9a381011b4af7e58b2cb" as const,
  "CulturePulseAnchor": "0x64f0009581a7007cc31040664e5d2d635f6a84fd" as const,
} as const;

export type DeploymentContractName =
  | keyof typeof deploymentAddresses8453;

export function getDeploymentAddress(
  name: DeploymentContractName,
  chain: number,
): `0x${string}` | undefined {
  if (chain === 8453) return deploymentAddresses8453[name];
  if (chain === 84532) return deploymentAddresses84532[name];
  return undefined;
}
