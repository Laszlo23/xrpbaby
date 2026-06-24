import { logoutMemberSession } from "@bc/culture-auth";
import type { PrivyInterface } from "@privy-io/react-auth";

import { clearPersistedActiveWallet } from "@/lib/wallet-session-storage";

export async function performWalletLogout(input: {
  authenticated: boolean;
  logout: PrivyInterface["logout"];
  getAccessToken?: () => Promise<string | null | undefined>;
}): Promise<void> {
  try {
    if (input.authenticated && input.getAccessToken) {
      const token = await input.getAccessToken();
      if (token) {
        await logoutMemberSession({ accessToken: token });
      }
    }
    if (input.authenticated) {
      await input.logout();
    }
  } finally {
    clearPersistedActiveWallet();
  }
}
