#!/usr/bin/env node
/**
 * Reads b3/contracts/deployments/<chain>.json + forge out/*.json
 * and writes b3/packages/contracts-sdk/src/generated/*
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const b3Root = path.resolve(__dirname, "..");
const contractsRoot = path.join(b3Root, "contracts");
const sdkRoot = path.join(b3Root, "packages", "contracts-sdk", "src", "generated");
const outRoot = path.join(contractsRoot, "out");

const DEPLOYMENT_FILE = path.join(contractsRoot, "deployments", "8453.json");

/** Solidity artifact name → kebab-case file + stable export symbol */
const ABI_ARTIFACTS = [
  { contract: "BuildingCultureDollar", file: "building-culture-dollar", export: "buildingCultureDollarAbi" },
  { contract: "BCDGenesisClaim", file: "bcd-genesis-claim", export: "bcdGenesisClaimAbi" },
  { contract: "BCDFixedPriceSale", file: "bcd-fixed-price-sale", export: "bcdFixedPriceSaleAbi" },
  { contract: "RaffleTicketCampaign", file: "raffle-ticket-campaign", export: "raffleTicketCampaignAbi" },
  { contract: "AgentShareCampaign", file: "agent-share-campaign", export: "agentShareCampaignAbi" },
  { contract: "DailyCheckIn", file: "daily-check-in", export: "dailyCheckInAbi" },
  { contract: "GenesisVaultPass", file: "genesis-vault-pass", export: "genesisVaultPassAbi" },
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function main() {
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    console.error("Missing", DEPLOYMENT_FILE);
    process.exit(1);
  }
  const deployment = readJson(DEPLOYMENT_FILE);
  const chainId = deployment.chainId;
  const contracts = deployment.contracts ?? {};

  ensureDir(sdkRoot);
  ensureDir(path.join(sdkRoot, "abis"));

  const entries = Object.entries(contracts)
    .map(([name, addr]) => `  "${name}": "${String(addr).toLowerCase()}" as const,`)
    .join("\n");

  const addressesTs = `/* eslint-disable -- generated */
/** Canonical deployment addresses (chain ${chainId}). Do not edit by hand — update contracts/deployments/${chainId}.json and re-run \`npm run contracts:sdk\` from b3/. */
export const deploymentAddresses${chainId} = {
${entries}
} as const;

export type DeploymentContractName = keyof typeof deploymentAddresses${chainId};

export function getDeploymentAddress(
  name: DeploymentContractName,
  chain: number,
): \`0x\${string}\` | undefined {
  if (chain !== ${chainId}) return undefined;
  return deploymentAddresses${chainId}[name];
}
`;

  fs.writeFileSync(path.join(sdkRoot, "addresses.ts"), addressesTs);

  for (const { contract, file, export: exportName } of ABI_ARTIFACTS) {
    const artifactPath = path.join(outRoot, `${contract}.sol`, `${contract}.json`);
    if (!fs.existsSync(artifactPath)) {
      console.warn("skip ABI (artifact missing):", artifactPath);
      continue;
    }
    const art = readJson(artifactPath);
    const abiJson = JSON.stringify(art.abi, null, 2);
    const abiTs = `/* eslint-disable -- generated from forge out/${contract}.sol/${contract}.json */
export const ${exportName} = ${abiJson} as const;
`;
    fs.writeFileSync(path.join(sdkRoot, "abis", `${file}.ts`), abiTs);
  }

  console.log("contracts-sdk generated OK:", sdkRoot);
}

main();
