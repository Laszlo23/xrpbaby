import type { PrivyClientConfig } from "@privy-io/react-auth";
import { base } from "@/lib/chains";
import { privyClientId } from "@/lib/privy-env";

/** Privy dashboard: enable Embedded wallets, Smart wallets (Base), and Export wallet. */
export function buildPrivyConfig(): PrivyClientConfig {
  return {
    loginMethods: ["email", "google", "apple", "wallet"],
    defaultChain: base,
    supportedChains: [base],
    appearance: {
      showWalletLoginFirst: false,
      theme: "dark",
      accentColor: "#C5FF41",
    },
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
