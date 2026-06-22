import type { PrivyClientConfig } from "@privy-io/react-auth";
import type { Chain } from "viem/chains";
import { base, bsc } from "./chains.js";
import {
  CULTURE_PRIVY_LOGIN_METHODS,
  culturePrivyLoginMethodsAndOrder,
} from "./privy-login-methods.js";
import {
  CULTURE_WALLET_LIST,
  DEFAULT_CULTURE_APP_NAME,
  cultureExternalWallets,
} from "./privy-wallet-integration.js";

export type BuildPrivyConfigOptions = {
  clientId?: string;
  walletConnectProjectId?: string;
  accentColor?: string;
  /** Shown in Coinbase Wallet + Base Account SDK init. */
  appName?: string;
  /** Chains shown in Privy — defaults to Base + BSC. */
  supportedChains?: readonly Chain[];
  createOnLogin?: "users-without-wallets" | "off" | "all-users";
};

/** Shared Privy config for the Culture ecosystem (embedded + smart wallet on Base). */
export function buildPrivyConfig(options: BuildPrivyConfigOptions = {}): PrivyClientConfig {
  const chains = options.supportedChains ?? ([base, bsc] as const);
  return {
    loginMethods: [...CULTURE_PRIVY_LOGIN_METHODS],
    loginMethodsAndOrder: culturePrivyLoginMethodsAndOrder(),
    defaultChain: chains[0]!,
    supportedChains: [...chains],
    appearance: {
      showWalletLoginFirst: false,
      theme: "dark",
      accentColor: (options.accentColor ?? "#C5FF41") as `#${string}`,
      walletList: [...CULTURE_WALLET_LIST],
    },
    externalWallets: cultureExternalWallets(options.appName ?? DEFAULT_CULTURE_APP_NAME),
    embeddedWallets: {
      ethereum: {
        createOnLogin: options.createOnLogin ?? "users-without-wallets",
      },
    },
    ...(options.clientId ? { clientId: options.clientId } : {}),
    walletConnectCloudProjectId: options.walletConnectProjectId,
  };
}
