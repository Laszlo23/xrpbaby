import { createPublicClient, createWalletClient, erc20Abi, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { BCC_ADDRESS } from "@bc/bcc-kit";

type PanicBccPayoutResult =
  | { ok: false; mode: "disabled" | "not_configured" | "failed"; error: string }
  | {
      ok: true;
      mode: "onchain";
      txHash: `0x${string}`;
      chainId: number;
      tokenAddress: Address;
      from: Address;
    };

function env() {
  return process.env as Record<string, string | undefined>;
}

function parseAddress(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

function parseChainId(raw: string | undefined): number {
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return base.id;
}

function resolveChain(chainId: number) {
  if (chainId === base.id) return base;
  if (chainId === baseSepolia.id) return baseSepolia;
  return base;
}

function resolveRpcUrl(chainId: number): string | undefined {
  const e = env();
  return (
    e.PANIC_SWITCH_BCC_REWARD_RPC_URL?.trim() ||
    e.BASE_RPC_URL?.trim() ||
    e.AGENT_BASE_RPC_URL?.trim() ||
    (chainId === base.id ? "https://mainnet.base.org" : undefined)
  );
}

function resolveTokenAddress(): Address {
  const e = env();
  return (
    parseAddress(e.PANIC_SWITCH_BCC_REWARD_TOKEN_ADDRESS) ??
    parseAddress(e.VITE_BCC_TOKEN_ADDRESS) ??
    (BCC_ADDRESS as Address)
  );
}

export async function trySendPanicBccReward(input: {
  to: Address;
  amountWei: bigint;
}): Promise<PanicBccPayoutResult> {
  const e = env();
  if (e.PANIC_SWITCH_BCC_REWARD_ONCHAIN !== "1") {
    return {
      ok: false,
      mode: "disabled",
      error: "onchain_bcc_reward_disabled",
    };
  }

  const privateKey = e.PANIC_SWITCH_BCC_REWARD_PRIVATE_KEY?.trim();
  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    return {
      ok: false,
      mode: "not_configured",
      error: "panic_bcc_reward_private_key_missing",
    };
  }

  const chainId = parseChainId(e.PANIC_SWITCH_BCC_REWARD_CHAIN_ID);
  const rpcUrl = resolveRpcUrl(chainId);
  if (!rpcUrl) {
    return {
      ok: false,
      mode: "not_configured",
      error: "panic_bcc_reward_rpc_missing",
    };
  }

  if (input.amountWei <= 0n) {
    return {
      ok: false,
      mode: "failed",
      error: "invalid_reward_amount",
    };
  }

  try {
    const chain = resolveChain(chainId);
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const transport = http(rpcUrl);
    const walletClient = createWalletClient({ account, chain, transport });
    const publicClient = createPublicClient({ chain, transport });
    const tokenAddress = resolveTokenAddress();

    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [input.to, input.amountWei],
      account,
      chain,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      return {
        ok: false,
        mode: "failed",
        error: "panic_bcc_reward_tx_failed",
      };
    }

    return {
      ok: true,
      mode: "onchain",
      txHash,
      chainId,
      tokenAddress,
      from: account.address,
    };
  } catch (e2) {
    return {
      ok: false,
      mode: "failed",
      error: e2 instanceof Error ? e2.message : "panic_bcc_reward_tx_error",
    };
  }
}
