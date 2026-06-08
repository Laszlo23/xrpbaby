import type { PrivyClientConfig } from "@privy-io/react-auth";
import { base, bsc } from "@/lib/chains";
import { privyClientId } from "@/lib/privy-env";

/** Privy dashboard: enable Embedded wallets, Smart wallets (Base + BNB Chain), and Export wallet. */
export function buildPrivyConfig(): PrivyClientConfig {
  return {
    // Keep Farcaster + wallet in the modal so Mini App and Base App users can
    // choose the most native flow immediately.
    loginMethods: ["farcaster", "wallet", "email", "google", "apple"],
    defaultChain: base,
    supportedChains: [base, bsc],
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
