import { BCC_ADDRESS, erc20Abi } from "@bc/bcc-kit";
import { createPublicClient, formatEther, formatUnits, http, type Address } from "viem";
import { base } from "viem/chains";

import {
  BASE_USDC_ADDRESS,
  getInvestorTreasuryWalletDefinitions,
  type TreasuryWalletDefinition,
} from "@/lib/investor-treasury-registry";
import {
  getXrplNetwork,
  getXrplTreasuryIntakeAddress,
  isXrplExecutionAllowed,
  xrpExecutionEnabledFlag,
} from "@/lib/xrpl-env";
import { TREASURY_REVENUE_RULES } from "@/lib/treasury-revenue-rules";

export type TreasuryWalletBalance = {
  id: string;
  label: string;
  role: string;
  chain: string;
  network: "mainnet" | "testnet";
  kind: "evm" | "xrpl";
  address: string;
  explorerUrl: string;
  balances: {
    native?: string;
    usdc?: string;
    bcc?: string;
  };
  error?: string;
};

export type InvestorTreasuryBalances = {
  ok: true;
  capturedAt: string;
  wallets: TreasuryWalletBalance[];
  revenueSplit: typeof TREASURY_REVENUE_RULES;
  xrpl: {
    network: ReturnType<typeof getXrplNetwork>;
    intakeAddress: string | null;
    executionEnabled: boolean;
    executionAllowed: boolean;
  };
};

function baseRpc(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org"
  );
}

async function readEvmBalances(def: TreasuryWalletDefinition): Promise<TreasuryWalletBalance> {
  const client = createPublicClient({ chain: base, transport: http(baseRpc()) });
  const holder = def.address as Address;
  const balances: TreasuryWalletBalance["balances"] = {};

  try {
    const ethWei = await client.getBalance({ address: holder });
    balances.native = `${formatEther(ethWei)} ETH`;
  } catch {
    balances.native = "—";
  }

  if (def.trackUsdc) {
    try {
      const usdcRaw = await client.readContract({
        address: BASE_USDC_ADDRESS as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [holder],
      });
      balances.usdc = `${formatUnits(usdcRaw, 6)} USDC`;
    } catch {
      balances.usdc = "—";
    }
  }

  if (def.trackBcc) {
    try {
      const bccRaw = await client.readContract({
        address: BCC_ADDRESS as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [holder],
      });
      balances.bcc = `${formatUnits(bccRaw, 18)} BCC`;
    } catch {
      balances.bcc = "—";
    }
  }

  return {
    id: def.id,
    label: def.label,
    role: def.role,
    chain: def.chain,
    network: def.network,
    kind: def.kind,
    address: def.address,
    explorerUrl: def.explorerUrl,
    balances,
  };
}

async function readXrplBalance(def: TreasuryWalletDefinition): Promise<TreasuryWalletBalance> {
  try {
    const { fetchXrplAccountBalance } = await import("@/server/xrp/treasury-intake");
    const xrp = await fetchXrplAccountBalance(def.address);
    return {
      id: def.id,
      label: def.label,
      role: def.role,
      chain: def.chain,
      network: def.network,
      kind: def.kind,
      address: def.address,
      explorerUrl: def.explorerUrl,
      balances: { native: xrp ?? "—" },
    };
  } catch (e) {
    return {
      id: def.id,
      label: def.label,
      role: def.role,
      chain: def.chain,
      network: def.network,
      kind: def.kind,
      address: def.address,
      explorerUrl: def.explorerUrl,
      balances: {},
      error: e instanceof Error ? e.message : "xrpl_unavailable",
    };
  }
}

export async function getInvestorTreasuryBalances(): Promise<InvestorTreasuryBalances> {
  const definitions = getInvestorTreasuryWalletDefinitions();
  const wallets = await Promise.all(
    definitions.map(async (def) => {
      if (def.kind === "xrpl") return readXrplBalance(def);
      return readEvmBalances(def);
    }),
  );

  return {
    ok: true,
    capturedAt: new Date().toISOString(),
    wallets,
    revenueSplit: TREASURY_REVENUE_RULES,
    xrpl: {
      network: getXrplNetwork(),
      intakeAddress: getXrplTreasuryIntakeAddress(),
      executionEnabled: xrpExecutionEnabledFlag(),
      executionAllowed: isXrplExecutionAllowed(),
    },
  };
}
