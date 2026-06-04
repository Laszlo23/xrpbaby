import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { authHubLoginUrl, authHubLogoutUrl, shouldUseAuthHub } from "./auth-hub.js";
import { DEFAULT_AUTH_HUB_ORIGIN } from "./env.js";

export function useCultureWallet(authHubOrigin: string = DEFAULT_AUTH_HUB_ORIGIN) {
  const { ready, authenticated, login, logout, user, getAccessToken } = usePrivy();
  const { address, isConnected, chainId } = useAccount();

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : authHubOrigin;
  const crossOrigin = shouldUseAuthHub(currentOrigin, authHubOrigin);

  return {
    ready,
    authenticated,
    isConnected,
    address,
    chainId,
    user,
    getAccessToken,
    login,
    logout,
    crossOrigin,
    signIn: () => {
      if (crossOrigin) {
        window.location.href = authHubLoginUrl(window.location.href, authHubOrigin);
        return;
      }
      void login();
    },
    signOut: (returnUrl?: string) => {
      const target = returnUrl ?? window.location.href;
      if (crossOrigin) {
        window.location.href = authHubLogoutUrl(target, authHubOrigin);
        return;
      }
      void logout();
    },
  };
}
