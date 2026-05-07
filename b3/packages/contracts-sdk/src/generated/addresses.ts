/* eslint-disable -- generated */
/** Canonical deployment addresses (chain 8453). Do not edit by hand — update contracts/deployments/8453.json and re-run `npm run contracts:sdk` from b3/. */
export const deploymentAddresses8453 = {
  "BuildingCultureDollar": "0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72" as const,
  "BCDGenesisClaim": "0x2bae6b04d0d1c8016cc863509395b68eb0021f58" as const,
  "RaffleTicketCampaign": "0xb1a88bf677400c23430b643a07229af832130ad8" as const,
  "AgentShareCampaign": "0x130e320a386b1ff0228492ddd65c380131ba86e9" as const,
} as const;

export type DeploymentContractName = keyof typeof deploymentAddresses8453;

export function getDeploymentAddress(
  name: DeploymentContractName,
  chain: number,
): `0x${string}` | undefined {
  if (chain !== 8453) return undefined;
  return deploymentAddresses8453[name];
}
