import { getBytecode } from "thirdweb/contract";
import type { ThirdwebContract } from "thirdweb";

/** Empty RPC result — viem cannot ABI-decode `0x`. Often wrong chain or wrong address. */
export function mapMarketplaceRpcError(error: unknown): Error {
  if (error instanceof Error) {
    const m = error.message.toLowerCase();
    if (
      m.includes("decode zero data") ||
      m.includes("cannot decode zero data") ||
      (m.includes("0x") && m.includes("decode"))
    ) {
      return new Error(
        "Marketplace RPC returned empty data. Confirm VITE_MARKETPLACE_CONTRACT_ADDRESS is your thirdweb Marketplace V3 contract and VITE_MARKETPLACE_NETWORK matches the chain it was deployed on (base = Base mainnet 8453, base-sepolia = Base Sepolia 84532). A typo, EOA address, or wrong network causes this.",
      );
    }
    return error;
  }
  return new Error(String(error));
}

/** Fail fast when the env points at an EOA or empty slot on this chain. */
export async function assertMarketplaceBytecode(
  contract: ThirdwebContract,
  chainDisplayName: string,
): Promise<void> {
  const code = await getBytecode(contract);
  if (code === "0x") {
    throw new Error(
      `No contract bytecode at the marketplace address on ${chainDisplayName}. Check VITE_MARKETPLACE_CONTRACT_ADDRESS and VITE_MARKETPLACE_NETWORK (must be the chain where Marketplace V3 is deployed).`,
    );
  }
}
