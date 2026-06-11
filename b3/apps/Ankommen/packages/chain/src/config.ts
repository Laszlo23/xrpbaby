export const AUSTRIA_CHAIN_ID = Number(process.env.AUSTRIA_CHAIN_ID ?? 7777777);

export const bccAbi = [
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
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
  },
] as const;

export function getChainConfig() {
  const rpcUrl = process.env.AUSTRIA_CHAIN_RPC ?? "http://localhost:8545";
  return {
    id: AUSTRIA_CHAIN_ID,
    name: "Austria Chain",
    nativeCurrency: { name: "BCC", symbol: "BCC", decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  } as const;
}

export function getBccContractAddress(): `0x${string}` | null {
  const addr = process.env.BCC_CONTRACT_ADDRESS;
  if (!addr || !addr.startsWith("0x")) return null;
  return addr as `0x${string}`;
}

export function getTreasuryAddress(): `0x${string}` | null {
  const addr = process.env.BCC_TREASURY_ADDRESS;
  if (!addr || !addr.startsWith("0x")) return null;
  return addr as `0x${string}`;
}

export function bccToWei(amount: number): bigint {
  return BigInt(amount) * 10n ** 18n;
}

export function weiToBcc(wei: bigint): number {
  return Number(wei / 10n ** 18n);
}
