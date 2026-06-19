import { BASE_USDC } from "@bc/bcc-kit";

import { limxAgentWalletAddress } from "@/lib/limx-agent-config";
import {
  getXrplNetwork,
  getXrplTreasuryIntakeAddress,
  xrplExplorerAccountUrl,
} from "@/lib/xrpl-env";
import { TREASURY_SAFE_ADDRESS } from "@/lib/treasury-revenue-rules";

export type TreasuryWalletKind = "evm" | "xrpl";

export type TreasuryWalletDefinition = {
  id: string;
  label: string;
  role: string;
  chain: string;
  network: "mainnet" | "testnet";
  kind: TreasuryWalletKind;
  address: string;
  explorerUrl: string;
  /** When set, fetch USDC (6 decimals) on Base for this holder. */
  trackUsdc?: boolean;
  /** When set, fetch BCC (18 decimals) on Base for this holder. */
  trackBcc?: boolean;
};

const ALCHEMY_AGENT_WALLET = "0x7ff3943d368c0ec6b0476766463e6002538b93ab" as const;

function basescanAddress(address: string): string {
  return `https://basescan.org/address/${address}`;
}

function resolveEvmAddress(envKey: string | undefined, fallback?: string): string | null {
  if (envKey) {
    const raw = process.env[envKey]?.trim();
    if (raw && /^0x[a-fA-F0-9]{40}$/.test(raw)) return raw;
  }
  if (fallback && /^0x[a-fA-F0-9]{40}$/.test(fallback)) return fallback;
  return null;
}

/** Published treasury wallets for investor transparency (no private keys). */
export function getInvestorTreasuryWalletDefinitions(): TreasuryWalletDefinition[] {
  const wallets: TreasuryWalletDefinition[] = [];

  wallets.push({
    id: "treasury-safe",
    label: "Protocol treasury (Gnosis Safe)",
    role: "Reserves, BCC settlement, governance — 2-of-3 multisig on Base.",
    chain: "Base",
    network: "mainnet",
    kind: "evm",
    address: TREASURY_SAFE_ADDRESS,
    explorerUrl: basescanAddress(TREASURY_SAFE_ADDRESS),
    trackUsdc: true,
    trackBcc: true,
  });

  const explicitX402 = resolveEvmAddress("X402_PAY_TO");
  if (explicitX402 && explicitX402.toLowerCase() !== TREASURY_SAFE_ADDRESS.toLowerCase()) {
    wallets.push({
      id: "x402-pay-to",
      label: "x402 settlement",
      role: "USDC receipts from premium APIs and agent SKUs (X402_PAY_TO).",
      chain: "Base",
      network: "mainnet",
      kind: "evm",
      address: explicitX402,
      explorerUrl: basescanAddress(explicitX402),
      trackUsdc: true,
    });
  }

  const limx = limxAgentWalletAddress();
  if (
    limx.toLowerCase() !== TREASURY_SAFE_ADDRESS.toLowerCase() &&
    limx.toLowerCase() !== explicitX402?.toLowerCase()
  ) {
    wallets.push({
      id: "limx-agent",
      label: "Limx agent wallet",
      role: "Non-custodial Limx revenue agent settlement on Base.",
      chain: "Base",
      network: "mainnet",
      kind: "evm",
      address: limx,
      explorerUrl: basescanAddress(limx),
      trackUsdc: true,
    });
  }

  const alchemyAgent = resolveEvmAddress("ALCHEMY_AGENT_WALLET_ADDRESS", ALCHEMY_AGENT_WALLET);
  if (alchemyAgent) {
    wallets.push({
      id: "alchemy-agent",
      label: "Alchemy CLI agent wallet",
      role: "Limited ops float for CLI/agent onchain actions — not treasury.",
      chain: "Base",
      network: "mainnet",
      kind: "evm",
      address: alchemyAgent,
      explorerUrl: basescanAddress(alchemyAgent),
      trackUsdc: false,
    });
  }

  const xrplIntake = getXrplTreasuryIntakeAddress();
  if (xrplIntake) {
    const network = getXrplNetwork();
    wallets.push({
      id: "xrpl-treasury-intake",
      label: "XRPL treasury intake (demo)",
      role:
        network === "mainnet"
          ? "Counsel-approved mainnet intake only — not enabled by default."
          : "Testnet demo rail for diligence — not an investment offer.",
      chain: "XRPL",
      network: network === "mainnet" ? "mainnet" : "testnet",
      kind: "xrpl",
      address: xrplIntake,
      explorerUrl: xrplExplorerAccountUrl(xrplIntake),
    });
  }

  return wallets;
}

export const BASE_USDC_ADDRESS = BASE_USDC;
