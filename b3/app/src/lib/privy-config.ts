import type { PrivyClientConfig } from "@privy-io/react-auth";
import { CULTURE_WALLET_LIST, cultureExternalWallets } from "@bc/culture-auth";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { base, bsc } from "@/lib/chains";
import { privyClientId } from "@/lib/privy-env";

/** Privy dashboard: enable Embedded wallets, Smart wallets (Base + BNB Chain), and Export wallet. */
export function buildPrivyConfig(): PrivyClientConfig {
  return {
    // Email/social in Privy modal; Farcaster only when login({ loginMethods }) requests it.
    // Wallet connects via connectWallet() / CultureBaseWalletButtons — not loginMethods "wallet"
    // (wallet row can break Privy modal in some builds — see packages/culture-auth).
    loginMethods: ["email", "google", "apple"],
    defaultChain: base,
    supportedChains: [base, bsc],
    appearance: {
      showWalletLoginFirst: false,
      theme: "dark",
      accentColor: "#C5FF41",
      walletList: [...CULTURE_WALLET_LIST],
    },
    externalWallets: cultureExternalWallets(
      BRAND_DISPLAY_NAME,
    ) as PrivyClientConfig["externalWallets"],
    embeddedWallets: {
      ethereum: {
        createOnLogin: "users-without-wallets",
      },
    },
    ...(privyClientId ? { clientId: privyClientId } : {}),
    walletConnectCloudProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as
      | string
      | undefined,
  };
}
