import { createPublicClient, erc20Abi, http, type Address } from "viem";
import { base } from "viem/chains";

const MIN_LP_WEI = 1_000_000_000_000_000n; // 0.001 LP token units

function lpTokenAddresses(): Address[] {
  const keys = [
    "VITE_BCC_AERODROME_LP_TOKEN",
    "BCC_AERODROME_LP_TOKEN",
    "VITE_BCC_BALANCER_BPT",
    "BCC_BALANCER_BPT",
    "VITE_BCC_AERODROME_POOL",
    "BCC_AERODROME_POOL",
    "VITE_BCC_BALANCER_POOL",
    "BCC_BALANCER_POOL",
  ];
  const seen = new Set<string>();
  const out: Address[] = [];
  for (const key of keys) {
    const raw = process.env[key]?.trim();
    if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) continue;
    const lower = raw.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push(raw as Address);
  }
  return out;
}

function lpSourceForToken(token: Address): "aerodrome" | "balancer" | "mixed" | undefined {
  const lower = token.toLowerCase();
  const aerodromeTokens = new Set(
    [
      process.env.VITE_BCC_AERODROME_LP_TOKEN,
      process.env.BCC_AERODROME_LP_TOKEN,
      process.env.VITE_BCC_AERODROME_POOL,
      process.env.BCC_AERODROME_POOL,
    ]
      .filter(Boolean)
      .map((v) => v!.trim().toLowerCase()),
  );
  const balancerTokens = new Set(
    [
      process.env.VITE_BCC_BALANCER_BPT,
      process.env.BCC_BALANCER_BPT,
      process.env.VITE_BCC_BALANCER_POOL,
      process.env.BCC_BALANCER_POOL,
    ]
      .filter(Boolean)
      .map((v) => v!.trim().toLowerCase()),
  );
  const isAero = aerodromeTokens.has(lower);
  const isBal = balancerTokens.has(lower);
  if (isAero && isBal) return "mixed";
  if (isBal) return "balancer";
  if (isAero) return "aerodrome";
  return undefined;
}

export async function walletHasBccLpProof(wallet: Address): Promise<{
  ok: boolean;
  error?: string;
  balance?: string;
  source?: "aerodrome" | "balancer" | "mixed";
}> {
  const tokens = lpTokenAddresses();
  if (tokens.length === 0) {
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
    let maxBalance = 0n;
    let maxToken: Address | null = null;
    for (const token of tokens) {
      const balance = await client.readContract({
        address: token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [wallet],
      });
      if (balance > maxBalance) {
        maxBalance = balance;
        maxToken = token;
      }
    }

    const source = maxToken ? lpSourceForToken(maxToken) : undefined;

    if (maxBalance < MIN_LP_WEI) {
      return {
        ok: false,
        error: "insufficient_lp_balance",
        balance: maxBalance.toString(),
        source,
      };
    }
    return { ok: true, balance: maxBalance.toString(), source };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `lp_read_failed:${msg}` };
  }
}
