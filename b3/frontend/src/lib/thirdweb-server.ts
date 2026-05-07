/**
 * Server-only: thirdweb client with secret key + x402 facilitator.
 * Do not import from client components or shared modules consumed by the browser bundle.
 */
import { createThirdwebClient } from "thirdweb";
import { facilitator } from "thirdweb/x402";

let facilitatorSingleton: ReturnType<typeof facilitator> | null = null;

function getServerWalletAddress(): `0x${string}` {
  const w = process.env.X402_SERVER_WALLET_ADDRESS?.trim();
  if (!w || !/^0x[a-fA-F0-9]{40}$/.test(w)) {
    throw new Error(
      "X402_SERVER_WALLET_ADDRESS is missing or invalid. Set a 0x-prefixed 40-hex address for the x402 server wallet.",
    );
  }
  return w as `0x${string}`;
}

/**
 * Thirdweb client for server routes (x402, Engine, etc.). Requires `THIRDWEB_SECRET_KEY`.
 */
export function getThirdwebServerClient() {
  const secretKey = process.env.THIRDWEB_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("THIRDWEB_SECRET_KEY is required for server-side thirdweb (x402).");
  }
  return createThirdwebClient({ secretKey });
}

/**
 * Memoized x402 facilitator for `settlePayment` / `verifyPayment`.
 */
export function getX402Facilitator() {
  if (facilitatorSingleton) {
    return facilitatorSingleton;
  }
  const client = getThirdwebServerClient();
  facilitatorSingleton = facilitator({
    client,
    serverWalletAddress: getServerWalletAddress(),
  });
  return facilitatorSingleton;
}
