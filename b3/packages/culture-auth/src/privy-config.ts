import type { PrivyClientConfig } from "@privy-io/react-auth";
import type { Chain } from "viem/chains";
import { base, bsc } from "./chains.js";

export type BuildPrivyConfigOptions = {
  clientId?: string;
  walletConnectProjectId?: string;
  accentColor?: string;
  /** Chains shown in Privy — defaults to Base + BSC. */
  supportedChains?: readonly Chain[];
  createOnLogin?: "users-without-wallets" | "off" | "all-users";
};

/** Shared Privy config for the Culture ecosystem (embedded + smart wallet on Base). */
export function buildPrivyConfig(options: BuildPrivyConfigOptions = {}): PrivyClientConfig {
  const chains = options.supportedChains ?? ([base, bsc] as const);
  return {
    // Wallet via connectWallet / app UI — not Privy modal "wallet" row (invalid React child in some builds).
    loginMethods: ["email", "google", "apple"],
    defaultChain: chains[0]!,
    supportedChains: [...chains],
    appearance: {
      showWalletLoginFirst: false,
      theme: "dark",
      accentColor: (options.accentColor ?? "#C5FF41") as `#${string}`,
    },
    embeddedWallets: {
      ethereum: {
        createOnLogin: options.createOnLogin ?? "users-without-wallets",
      },
    },
    ...(options.clientId ? { clientId: options.clientId } : {}),
    walletConnectCloudProjectId: options.walletConnectProjectId,
  };
}
