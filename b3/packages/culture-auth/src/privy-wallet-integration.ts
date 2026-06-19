import type { PrivyClientConfig } from "@privy-io/react-auth";
import type { ConnectWalletModalOptions } from "@privy-io/react-auth";

/** Wallet order for Privy login / connectWallet modals — Base ecosystem first. */
export const CULTURE_WALLET_LIST: NonNullable<
  NonNullable<PrivyClientConfig["appearance"]>["walletList"]
> = [
  "base_account",
  "coinbase_wallet",
  "detected_ethereum_wallets",
  "metamask",
  "wallet_connect",
];

export const DEFAULT_CULTURE_APP_NAME = "Build Culture";

export function cultureExternalWallets(
  appName: string = DEFAULT_CULTURE_APP_NAME,
): NonNullable<PrivyClientConfig["externalWallets"]> {
  return {
    coinbaseWallet: { config: { appName } },
    baseAccount: { config: { appName } },
  };
}

export const BASE_ACCOUNT_CONNECT_OPTIONS: ConnectWalletModalOptions = {
  walletList: ["base_account", "coinbase_wallet"],
  preSelectedWalletId: "base_account",
};

export const COINBASE_WALLET_CONNECT_OPTIONS: ConnectWalletModalOptions = {
  walletList: ["coinbase_wallet", "base_account"],
  preSelectedWalletId: "coinbase_wallet",
};

/** Opens Privy connect modal scoped to browser-injected wallets (includes Brave). */
export const BRAVE_WALLET_CONNECT_OPTIONS: ConnectWalletModalOptions = {
  walletList: ["detected_ethereum_wallets", "metamask"],
};
