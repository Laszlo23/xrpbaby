import { createPublicClient, createWalletClient, custom, http, type Hash } from "viem";

export const AUSTRIA_CHAIN_ID = Number(process.env.NEXT_PUBLIC_AUSTRIA_CHAIN_ID ?? 7777777);
export const AUSTRIA_CHAIN_RPC = process.env.NEXT_PUBLIC_AUSTRIA_CHAIN_RPC ?? "http://localhost:8545";
export const BCC_CONTRACT = process.env.NEXT_PUBLIC_BCC_CONTRACT_ADDRESS as `0x${string}` | undefined;
export const BCC_TREASURY = process.env.NEXT_PUBLIC_BCC_TREASURY_ADDRESS as `0x${string}` | undefined;

export const austriaChain = {
  id: AUSTRIA_CHAIN_ID,
  name: "Austria Chain",
  nativeCurrency: { name: "BCC", symbol: "BCC", decimals: 18 },
  rpcUrls: { default: { http: [AUSTRIA_CHAIN_RPC] } },
} as const;

const bccAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export function bccToWei(amount: number): bigint {
  return BigInt(amount) * 10n ** 18n;
}

export async function connectWallet(): Promise<`0x${string}`> {
  const eth = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<string[]> } }).ethereum;
  if (!eth) throw new Error("No wallet found. Install MetaMask and add Austria Chain (localhost:8545).");

  await eth.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${AUSTRIA_CHAIN_ID.toString(16)}`,
        chainName: "Austria Chain",
        rpcUrls: [AUSTRIA_CHAIN_RPC],
        nativeCurrency: { name: "BCC", symbol: "BCC", decimals: 18 },
      },
    ],
  });

  const accounts = await eth.request({ method: "eth_requestAccounts" });
  return accounts[0] as `0x${string}`;
}

export async function signMessage(address: `0x${string}`, message: string): Promise<`0x${string}`> {
  const eth = (window as unknown as { ethereum?: { request: (args: { method: string; params: unknown[] }) => Promise<string> } }).ethereum;
  if (!eth) throw new Error("No wallet found");
  return eth.request({
    method: "personal_sign",
    params: [message, address],
  }) as Promise<`0x${string}`>;
}

export async function sendBccToTreasury(from: `0x${string}`, amountWhole: number): Promise<Hash> {
  if (!BCC_CONTRACT || !BCC_TREASURY) {
    throw new Error("BCC contract not configured on this environment");
  }

  const eth = (window as unknown as { ethereum?: unknown }).ethereum;
  if (!eth) throw new Error("No wallet found");

  const walletClient = createWalletClient({
    account: from,
    chain: austriaChain,
    transport: custom(eth as never),
  });

  return walletClient.writeContract({
    address: BCC_CONTRACT,
    abi: bccAbi,
    functionName: "transfer",
    args: [BCC_TREASURY, bccToWei(amountWhole)],
  });
}

export function getPublicClient() {
  return createPublicClient({ chain: austriaChain, transport: http(AUSTRIA_CHAIN_RPC) });
}
