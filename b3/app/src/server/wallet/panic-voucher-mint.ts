import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  http,
  parseAbi,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

type PanicVoucherMintResult =
  | { ok: false; mode: "disabled" | "not_configured" | "failed"; error: string }
  | {
      ok: true;
      mode: "onchain";
      txHash: `0x${string}`;
      chainId: number;
      contractAddress: Address;
      from: Address;
      tokenId: string | null;
    };

const panicVoucherAbi = parseAbi([
  "function mintVoucher(address to, bytes32 claimDigest) returns (uint256 tokenId)",
  "event PanicVoucherMinted(address indexed to, uint256 indexed tokenId, bytes32 indexed claimDigest)",
]);

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
    e.PANIC_VOUCHER_NFT_RPC_URL?.trim() ||
    e.BASE_RPC_URL?.trim() ||
    e.AGENT_BASE_RPC_URL?.trim() ||
    (chainId === base.id ? "https://mainnet.base.org" : undefined)
  );
}

function resolveContractAddress(): Address | undefined {
  const e = env();
  return parseAddress(e.PANIC_VOUCHER_NFT_CONTRACT_ADDRESS);
}

export async function tryMintPanicVoucherNft(input: {
  to: Address;
  claimDigest: `0x${string}`;
}): Promise<PanicVoucherMintResult> {
  const e = env();
  if (e.PANIC_VOUCHER_NFT_ONCHAIN !== "1") {
    return { ok: false, mode: "disabled", error: "panic_voucher_nft_disabled" };
  }
  const privateKey = e.PANIC_VOUCHER_NFT_PRIVATE_KEY?.trim();
  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    return { ok: false, mode: "not_configured", error: "panic_voucher_private_key_missing" };
  }
  const contractAddress = resolveContractAddress();
  if (!contractAddress) {
    return { ok: false, mode: "not_configured", error: "panic_voucher_contract_missing" };
  }
  const chainId = parseChainId(e.PANIC_VOUCHER_NFT_CHAIN_ID);
  const rpcUrl = resolveRpcUrl(chainId);
  if (!rpcUrl) {
    return { ok: false, mode: "not_configured", error: "panic_voucher_rpc_missing" };
  }
  try {
    const chain = resolveChain(chainId);
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const transport = http(rpcUrl);
    const walletClient = createWalletClient({ account, chain, transport });
    const publicClient = createPublicClient({ chain, transport });
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: panicVoucherAbi,
      functionName: "mintVoucher",
      args: [input.to, input.claimDigest],
      account,
      chain,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      return { ok: false, mode: "failed", error: "panic_voucher_tx_failed" };
    }
    let tokenId: string | null = null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== contractAddress.toLowerCase()) continue;
      try {
        const parsed = decodeEventLog({
          abi: panicVoucherAbi,
          eventName: "PanicVoucherMinted",
          data: log.data,
          topics: log.topics,
        });
        tokenId = parsed.args.tokenId.toString();
        break;
      } catch {
        // Ignore unrelated logs.
      }
    }
    return {
      ok: true,
      mode: "onchain",
      txHash,
      chainId,
      contractAddress,
      from: account.address,
      tokenId,
    };
  } catch (error) {
    return {
      ok: false,
      mode: "failed",
      error: error instanceof Error ? error.message : "panic_voucher_tx_error",
    };
  }
}
