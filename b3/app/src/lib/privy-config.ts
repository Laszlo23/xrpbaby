import type { PrivyClientConfig } from "@privy-io/react-auth";
import { base, bsc } from "@/lib/chains";
import { privyClientId } from "@/lib/privy-env";

/** Privy dashboard: enable Embedded wallets, Smart wallets (Base + BNB Chain), and Export wallet. */
export function buildPrivyConfig(): PrivyClientConfig {
  return {
    // Social + email only in Privy modal. Wallet via WalletControls "External wallet" (connectWallet).
    // Omitting Privy's built-in "wallet" / "farcaster" login methods avoids invalid React child crashes in the modal UI.
    loginMethods: ["email", "google", "apple"],
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
