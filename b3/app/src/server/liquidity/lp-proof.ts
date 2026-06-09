import { createPublicClient, erc20Abi, http, type Address } from "viem";
import { base } from "viem/chains";

const MIN_LP_WEI = 1_000_000_000_000_000n; // 0.001 LP token units

function lpTokenAddress(): Address | null {
  const raw =
    process.env.VITE_BCC_AERODROME_LP_TOKEN?.trim() || process.env.BCC_AERODROME_LP_TOKEN?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return null;
  return raw as Address;
}

export async function walletHasBccLpProof(wallet: Address): Promise<{
  ok: boolean;
  error?: string;
  balance?: string;
}> {
  const token = lpTokenAddress();
  if (!token) {
    return {
      ok: false,
      error: "lp_token_not_configured",
    };
  }

  const rpc =
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org";

  const client = createPublicClient({
    chain: base,
    transport: http(rpc),
  });

  try {
    const balance = await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [wallet],
    });
    if (balance < MIN_LP_WEI) {
      return { ok: false, error: "insufficient_lp_balance", balance: balance.toString() };
    }
    return { ok: true, balance: balance.toString() };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `lp_read_failed:${msg}` };
  }
}
