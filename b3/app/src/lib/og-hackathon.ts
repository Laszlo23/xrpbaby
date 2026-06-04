/** 0G APAC Hackathon — shared copy for `/0g/agentid` and submission docs. */

export const OG_CHAIN_ID = 16661;
export const OG_CHAIN_NAME = "0G Chain mainnet";
export const OG_RPC = "https://evmrpc.0g.ai";

export const OG_AGENT_ID_DEFAULTS = {
  contract: "0x0451b1d37058ad57df22d7185aabc6b0a36fc41e",
  deployTx: "0x4629018662bf4f8f1cf6438c749d56307c1fcb4aa79e044f8692c31c88572d3e",
  mintTx: "0xf920a643320272e067b137e11b85f07afe40e4dfb820e3de3754d68dc945d7d9",
} as const;

export const OG_HACKATHON_REPO = "https://github.com/Laszlo23/xrpbaby";
export const OG_HACKATHON_JUDGE_README = "b3/docs/0G_HACKATHON_JUDGE_README.md";
export const OG_HACKATHON_PAGE = "https://www.hackquest.io/hackathons/0G-APAC-Hackathon";
export const OG_PRODUCTION_PROOF_URL = "https://app.buildingcultureid.space/0g/agentid";
export const OG_AGENT_ID_SOL_PATH = "b3/contracts/src/AgentId.sol";
export const OG_PROOF_PAGE_PATH = "b3/app/src/routes/0g.agentid.tsx";
export const OG_SUBMISSION_DOC = "b3/docs/0G_HACKATHON_SUBMISSION.md";
export const OG_METADATA_PATH = "b3/app/public/0g/agentid/1.json";

/** Primary product positioning (HackQuest, judges, X). */
export const OG_PROJECT_NAME = "BUILDCHAIN Agent ID";

export const OG_PROJECT_DESCRIPTION =
  "We're building BUILDCHAIN Agent ID, an on-chain identity layer for AI agents on the 0G Chain. Using ERC-721, agents receive portable, user-owned identities that can be verified and integrated across decentralized applications.";

/** HackQuest one-sentence field (≤30 words). */
export const OG_PROJECT_ONE_LINER =
  "BUILDCHAIN Agent ID: ERC-721 on 0G Chain gives AI agents portable, user-owned identities verifiable across decentralized applications.";

export const OG_JUDGE_ONE_LINER =
  "This ERC-721 is our Agent ID primitive on 0G Chain mainnet; ownership is the identity anchor.";

/** Paste into X — under 280 chars with hashtags. */
export function buildOgHackathonXPost(
  contract: string = OG_AGENT_ID_DEFAULTS.contract,
  proofUrl: string = OG_PRODUCTION_PROOF_URL,
): string {
  return [
    `${OG_PROJECT_NAME} on @0G_labs`,
    "",
    "On-chain identity layer for AI agents on 0G Chain — ERC-721 portable, user-owned IDs for dApps. Mainnet deploy + proof page:",
    "",
    `Contract: ${contract}`,
    "",
    `Proof: ${proofUrl}`,
    "",
    "#0GHackathon #BuildOn0G",
    "@0G_labs @0g_CN @0g_Eco @HackQuest_",
  ].join("\n");
}

/** HackQuest “0G On-Chain Integration Proof” field (≤300 chars). */
export function buildHackQuestOnChainProof(
  contract: string = OG_AGENT_ID_DEFAULTS.contract,
  proofUrl: string = OG_PRODUCTION_PROOF_URL,
): string {
  return `AgentId ERC-721 on 0G mainnet (16661). Contract: ${contract}. Explorer: ${ogExplorerAddressUrl(contract)}. Live proof: ${proofUrl}`;
}

/** HackQuest GitHub field (≤300 chars). */
export function buildHackQuestGithubField(): string {
  return `${OG_HACKATHON_REPO} — Judge README: ${OG_HACKATHON_JUDGE_README}. Repro: cd b3/app && npm i && npm run dev → /0g/agentid. Contract: ${OG_AGENT_ID_SOL_PATH}`;
}

export function ogExplorerAddressUrl(address: string): string {
  return `https://chainscan.0g.ai/address/${address}#code`;
}

export function ogExplorerTxUrl(hash: string): string {
  return `https://chainscan.0g.ai/tx/${hash}`;
}

function viteOgEnv(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("VITE_OG_AGENT_ID_")) return undefined;
  return trimmed;
}

/** Env overrides with mainnet defaults when unset (dev + production). */
export function resolveOgAgentIdProof(
  env: Record<string, unknown> = import.meta.env as Record<string, unknown>,
) {
  return {
    contract: viteOgEnv(env.VITE_OG_AGENT_ID_CONTRACT_ADDRESS) ?? OG_AGENT_ID_DEFAULTS.contract,
    deployTx: viteOgEnv(env.VITE_OG_AGENT_ID_DEPLOY_TX) ?? OG_AGENT_ID_DEFAULTS.deployTx,
    mintTx: viteOgEnv(env.VITE_OG_AGENT_ID_MINT_TX) ?? OG_AGENT_ID_DEFAULTS.mintTx,
  };
}
