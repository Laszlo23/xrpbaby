import { base, baseSepolia } from "viem/chains";

function readChainId(): number {
  const raw =
    process.env.VITE_IDENTITY_CHAIN_ID ??
    process.env.VITE_EVM_CHAIN_ID ??
    import.meta.env?.VITE_IDENTITY_CHAIN_ID ??
    import.meta.env?.VITE_EVM_CHAIN_ID ??
    "8453";
  return Number(raw);
}

export function getIdentityServerConfig() {
  const chainId = readChainId();
  const chain = chainId === base.id ? base : baseSepolia;
  const contractAddress = (
    process.env.VITE_IDENTITY_CONTRACT_ADDRESS ??
    import.meta.env?.VITE_IDENTITY_CONTRACT_ADDRESS ??
    ""
  ) as `0x${string}`;
  const rpcUrl =
    process.env.VITE_BASE_RPC_URL?.trim() ||
    import.meta.env?.VITE_BASE_RPC_URL?.trim() ||
    (chain.id === base.id ? "https://mainnet.base.org" : "https://sepolia.base.org");

  const configured =
    contractAddress.length === 42 && contractAddress.startsWith("0x");

  return { chain, chainId: chain.id, contractAddress, rpcUrl, configured } as const;
}
