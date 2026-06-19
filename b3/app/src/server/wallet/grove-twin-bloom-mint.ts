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

type GroveTwinBloomMintResult =
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

const groveTwinBloomAbi = parseAbi([
  "function mintVoucher(address to, bytes32 claimDigest) returns (uint256 tokenId)",
  "event GroveTwinBloomMinted(address indexed to, uint256 indexed tokenId, bytes32 indexed claimDigest)",
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
    e.GROVE_TWIN_BLOOM_NFT_RPC_URL?.trim() ||
    e.BASE_RPC_URL?.trim() ||
    e.AGENT_BASE_RPC_URL?.trim() ||
    (chainId === base.id ? "https://mainnet.base.org" : undefined)
  );
}

function resolveContractAddress(): Address | undefined {
  const e = env();
  return parseAddress(e.GROVE_TWIN_BLOOM_NFT_CONTRACT_ADDRESS);
}

export async function tryMintGroveTwinBloomNft(input: {
  to: Address;
  claimDigest: `0x${string}`;
}): Promise<GroveTwinBloomMintResult> {
  const e = env();
  if (e.GROVE_TWIN_BLOOM_NFT_ONCHAIN !== "1") {
    return { ok: false, mode: "disabled", error: "grove_twin_bloom_nft_disabled" };
  }
  const privateKey = e.GROVE_TWIN_BLOOM_NFT_PRIVATE_KEY?.trim();
  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    return { ok: false, mode: "not_configured", error: "grove_twin_bloom_private_key_missing" };
  }
  const contractAddress = resolveContractAddress();
  if (!contractAddress) {
    return { ok: false, mode: "not_configured", error: "grove_twin_bloom_contract_missing" };
  }
  const chainId = parseChainId(e.GROVE_TWIN_BLOOM_NFT_CHAIN_ID);
  const rpcUrl = resolveRpcUrl(chainId);
  if (!rpcUrl) {
    return { ok: false, mode: "not_configured", error: "grove_twin_bloom_rpc_missing" };
  }
  try {
    const chain = resolveChain(chainId);
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const transport = http(rpcUrl);
    const walletClient = createWalletClient({ account, chain, transport });
    const publicClient = createPublicClient({ chain, transport });
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: groveTwinBloomAbi,
      functionName: "mintVoucher",
      args: [input.to, input.claimDigest],
      account,
      chain,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      return { ok: false, mode: "failed", error: "grove_twin_bloom_tx_failed" };
    }
    let tokenId: string | null = null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== contractAddress.toLowerCase()) continue;
      try {
        const parsed = decodeEventLog({
          abi: groveTwinBloomAbi,
          eventName: "GroveTwinBloomMinted",
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
      error: error instanceof Error ? error.message : "grove_twin_bloom_tx_error",
    };
  }
}
