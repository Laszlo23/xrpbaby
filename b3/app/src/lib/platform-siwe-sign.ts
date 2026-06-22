import type { ConnectedWallet } from "@privy-io/react-auth";
import { createWalletClient, custom, type Address } from "viem";

import { base } from "@/lib/chains";
import { detectFarcasterMiniApp } from "@/lib/farcaster-miniapp";

const WALLET_READY_ATTEMPTS = 12;
const WALLET_READY_DELAY_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isUserRejection(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code) : "";
  const name = "name" in error ? String((error as { name?: unknown }).name) : "";
  const message = "message" in error ? String((error as { message?: unknown }).message) : "";
  return (
    code === "4001" ||
    /user rejected|rejected the request|denied/i.test(message) ||
    /UserRejected/i.test(name)
  );
}

function pickPrivyWallet(
  wallets: ConnectedWallet[],
  address: Address,
): ConnectedWallet | undefined {
  return wallets.find((w) => w.address?.toLowerCase() === address.toLowerCase());
}

function pickAnyPrivyWallet(wallets: ConnectedWallet[]): ConnectedWallet | undefined {
  return wallets.find((w) => w.address);
}

async function signViaFarcasterProvider(message: string, address: Address): Promise<string> {
  const sdk = (await import("@farcaster/miniapp-sdk")).default;
  const client = createWalletClient({
    account: address,
    chain: base,
    transport: custom(sdk.wallet.ethProvider),
  });
  return client.signMessage({ message });
}

async function signViaPrivyProvider(wallet: ConnectedWallet, message: string): Promise<string> {
  const provider = await wallet.getEthereumProvider();
  const client = createWalletClient({
    account: wallet.address as Address,
    chain: base,
    transport: custom(provider),
  });
  return client.signMessage({ message });
}

export type PrivySignMessage = (
  input: { message: string },
  options?: { address?: string },
) => Promise<{ signature: string }>;

type SignPlatformMessageInput = {
  prepared: string;
  address: Address;
  wallets: ConnectedWallet[];
  getWallets: () => ConnectedWallet[];
  wagmiAddress?: Address;
  privyAuthenticated: boolean;
  privySignMessage?: PrivySignMessage;
  signMessageAsync: (args: { message: string; account: Address }) => Promise<string>;
};

async function tryPrivySignMessage(
  privySignMessage: PrivySignMessage,
  prepared: string,
  address: Address,
): Promise<string | undefined> {
  try {
    const { signature } = await privySignMessage({ message: prepared }, { address });
    return signature;
  } catch (error) {
    if (isUserRejection(error)) throw error;
    return undefined;
  }
}

/** Resolve a Privy / wagmi / Farcaster signer for an already-built SIWE message. */
export async function signPlatformSiweMessage(
  input: SignPlatformMessageInput,
): Promise<{ signature: string; address: string }> {
  const {
    prepared,
    address,
    wallets,
    getWallets,
    wagmiAddress,
    privyAuthenticated,
    privySignMessage,
    signMessageAsync,
  } = input;

  if (privyAuthenticated && privySignMessage) {
    const privySignature = await tryPrivySignMessage(privySignMessage, prepared, address);
    if (privySignature) return { signature: privySignature, address };
  }

  let wallet = pickPrivyWallet(wallets, address) ?? pickPrivyWallet(getWallets(), address);

  for (let attempt = 0; !wallet && attempt < WALLET_READY_ATTEMPTS; attempt += 1) {
    await sleep(WALLET_READY_DELAY_MS);
    wallet = pickPrivyWallet(getWallets(), address);
  }

  if (wallet) {
    try {
      const signature = await wallet.sign(prepared);
      return { signature, address: wallet.address };
    } catch (error) {
      if (isUserRejection(error)) throw error;
      try {
        const signature = await signViaPrivyProvider(wallet, prepared);
        return { signature, address: wallet.address };
      } catch (providerError) {
        if (isUserRejection(providerError)) throw providerError;
      }
    }
  }

  if (wagmiAddress?.toLowerCase() === address.toLowerCase()) {
    try {
      const signature = await signMessageAsync({ message: prepared, account: address });
      return { signature, address };
    } catch (error) {
      if (isUserRejection(error)) throw error;
    }
  }

  if (await detectFarcasterMiniApp()) {
    const signature = await signViaFarcasterProvider(prepared, address);
    return { signature, address };
  }

  let fallback = pickAnyPrivyWallet(wallets) ?? pickAnyPrivyWallet(getWallets());
  for (let attempt = 0; !fallback && attempt < WALLET_READY_ATTEMPTS; attempt += 1) {
    await sleep(WALLET_READY_DELAY_MS);
    fallback = pickAnyPrivyWallet(getWallets());
  }

  if (fallback?.address) {
    try {
      const signature = await fallback.sign(prepared);
      return { signature, address: fallback.address };
    } catch (error) {
      if (isUserRejection(error)) throw error;
    }
  }

  throw new Error("wallet_not_ready");
}
