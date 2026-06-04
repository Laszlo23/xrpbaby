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
export const OG_AGENT_ID_SOL_PATH = "b3/contracts/src/AgentId.sol";
export const OG_PROOF_PAGE_PATH = "b3/app/src/routes/0g.agentid.tsx";
export const OG_SUBMISSION_DOC = "b3/docs/0G_HACKATHON_SUBMISSION.md";

export const OG_JUDGE_ONE_LINER =
  "This ERC-721 is our Agent ID primitive on 0G Chain mainnet; ownership is the identity anchor.";

/** Paste into X — under 280 chars with hashtags. */
export function buildOgHackathonXPost(contract: string = OG_AGENT_ID_DEFAULTS.contract): string {
  return [
    "BUILDCHAIN — Agent ID proof on @0G_labs",
    "",
    "We deployed a minimal Agent ID (ERC-721) on 0G Chain mainnet and wired an in-app proof page with explorer links.",
    "",
    `Contract: ${contract}`,
    "",
    "Proof: /0g/agentid",
    "",
    "#0GHackathon #BuildOn0G",
    "@0G_labs @0g_CN @0g_Eco @HackQuest_",
  ].join("\n");
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
    contract:
      viteOgEnv(env.VITE_OG_AGENT_ID_CONTRACT_ADDRESS) ?? OG_AGENT_ID_DEFAULTS.contract,
    deployTx: viteOgEnv(env.VITE_OG_AGENT_ID_DEPLOY_TX) ?? OG_AGENT_ID_DEFAULTS.deployTx,
    mintTx: viteOgEnv(env.VITE_OG_AGENT_ID_MINT_TX) ?? OG_AGENT_ID_DEFAULTS.mintTx,
  };
}
