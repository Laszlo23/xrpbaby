import { base } from "viem/chains";
import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const complianceAbi = parseAbi([
  "function setWalletStatus(address wallet, uint8 status) external",
]);

/** IComplianceRegistry.Status: Verified = 2 */
const STATUS_VERIFIED = 2;

/**
 * Relay KYC verification on-chain. Production expects Base registry + ETH gas.
 * Env: RELAYER_PRIVATE_KEY, COMPLIANCE_REGISTRY_ADDRESS (Base deployment on mainnet).
 */
export async function relaySetVerified(wallet: `0x${string}`): Promise<`0x${string}` | null> {
  const pk = process.env.RELAYER_PRIVATE_KEY;
  const registry = process.env.COMPLIANCE_REGISTRY_ADDRESS as `0x${string}` | undefined;
  if (!pk || !registry || !pk.startsWith("0x")) {
    console.warn("[compliance-relay] missing RELAYER_PRIVATE_KEY or COMPLIANCE_REGISTRY_ADDRESS");
    return null;
  }

  const rpcUrl =
    process.env.BASE_RPC_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_RPC?.trim() ||
    "https://mainnet.base.org";

  const account = privateKeyToAccount(pk as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });

  const hash = await client.writeContract({
    address: registry,
    abi: complianceAbi,
    functionName: "setWalletStatus",
    args: [wallet, STATUS_VERIFIED],
  });
  return hash;
}
