import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getChainConfig } from "../src/config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPaths = [resolve(root, "../../.env"), resolve(root, "../../services/api/.env")];

function upsertEnvFile(path: string, values: Record<string, string>) {
  if (!existsSync(path)) return;
  let env = readFileSync(path, "utf8");
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    env = env.match(new RegExp(`^${key}=`, "m"))
      ? env.replace(new RegExp(`^${key}=.*`, "m"), line)
      : `${env.trim()}\n${line}\n`;
  }
  writeFileSync(path, env);
  console.log(`Updated ${path}`);
}

function deployWithForge(rpc: string, privateKey: string): string {
  const out = execSync(
    `forge create --broadcast --rpc-url "${rpc}" --private-key "${privateKey}" contracts/BCC.sol:BCC`,
    { cwd: root, encoding: "utf8" },
  );
  const match = out.match(/Deployed to:\s*(0x[a-fA-F0-9]+)/);
  if (!match?.[1]) throw new Error("forge create did not return address");
  return match[1];
}

async function main() {
  const rpc = process.env.AUSTRIA_CHAIN_RPC ?? "http://localhost:8545";
  const privateKey =
    process.env.BCC_TREASURY_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const chain = getChainConfig();

  const address = deployWithForge(rpc, privateKey);
  const { privateKeyToAccount } = await import("viem/accounts");
  const treasury = privateKeyToAccount(
    privateKey.startsWith("0x") ? (privateKey as `0x${string}`) : (`0x${privateKey}` as `0x${string}`),
  ).address;

  console.log("BCC deployed at:", address);
  console.log("Treasury address:", treasury);

  const envValues = {
    BCC_CONTRACT_ADDRESS: address,
    BCC_TREASURY_ADDRESS: treasury,
    BCC_TREASURY_PRIVATE_KEY: privateKey,
    AUSTRIA_CHAIN_RPC: rpc,
    AUSTRIA_CHAIN_ID: String(chain.id),
    NEXT_PUBLIC_AUSTRIA_CHAIN_RPC: rpc,
    NEXT_PUBLIC_AUSTRIA_CHAIN_ID: String(chain.id),
    NEXT_PUBLIC_BCC_CONTRACT_ADDRESS: address,
    NEXT_PUBLIC_BCC_TREASURY_ADDRESS: treasury,
  };

  for (const path of envPaths) upsertEnvFile(path, envValues);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
