#!/usr/bin/env node
/**
 * Reads b3/contracts/deployments/*.json + forge out/*.json
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
const deploymentsDir = path.join(contractsRoot, "deployments");

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

function listDeploymentFiles() {
  if (!fs.existsSync(deploymentsDir)) return [];
  return fs
    .readdirSync(deploymentsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(deploymentsDir, f));
}

function main() {
  const deploymentFiles = listDeploymentFiles();
  if (deploymentFiles.length === 0) {
    console.error("No contracts/deployments/*.json files found");
    process.exit(1);
  }

  ensureDir(sdkRoot);
  ensureDir(path.join(sdkRoot, "abis"));

  const chainBlocks = [];
  const chainIds = [];

  for (const file of deploymentFiles) {
    const deployment = readJson(file);
    const chainId = deployment.chainId;
    if (!chainId) {
      console.warn("skip (no chainId):", file);
      continue;
    }
    chainIds.push(chainId);
    const contracts = deployment.contracts ?? {};
    const entries = Object.entries(contracts)
      .map(([name, addr]) => `  "${name}": "${String(addr).toLowerCase()}" as const,`)
      .join("\n");
    chainBlocks.push(`export const deploymentAddresses${chainId} = {
${entries}
} as const;`);
  }

  const getDeploymentCases = chainIds
    .map((id) => `  if (chain === ${id}) return deploymentAddresses${id}[name];`)
    .join("\n");

  const addressesTs = `/* eslint-disable -- generated */
${chainBlocks.join("\n\n")}

export type DeploymentContractName =
  | keyof typeof deploymentAddresses${chainIds[0] ?? 8453};

export function getDeploymentAddress(
  name: DeploymentContractName,
  chain: number,
): \`0x\${string}\` | undefined {
${getDeploymentCases}
  return undefined;
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
    const abiTs = `/* eslint-disable -- generated from forge out/${contract}.sol/${contract}.json */
export const ${exportName} = ${JSON.stringify(art.abi, null, 2)} as const;
`;
    fs.writeFileSync(path.join(sdkRoot, "abis", `${file}.ts`), abiTs);
  }

  console.log("contracts-sdk generated OK:", sdkRoot, "chains:", chainIds.join(", "));
}

main();
