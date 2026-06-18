import { PrivyClient } from "@privy-io/server-auth";

let client: PrivyClient | null = null;

function getPrivyClient(): PrivyClient | null {
  const appId = process.env.PRIVY_APP_ID?.trim() || process.env.VITE_PRIVY_APP_ID?.trim();
  const appSecret = process.env.PRIVY_APP_SECRET?.trim();
  if (!appId || !appSecret) return null;
  if (!client) {
    client = new PrivyClient(appId, appSecret);
  }
  return client;
}

export async function verifyPrivyAccessToken(
  authorizationHeader: string | null,
): Promise<{ userId: string } | { error: string; status: number }> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return { error: "missing_token", status: 401 };
  }
  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) {
    return { error: "missing_token", status: 401 };
  }
  const privy = getPrivyClient();
  if (!privy) {
    return { error: "privy_not_configured", status: 503 };
  }
  try {
    const claims = await privy.verifyAuthToken(token);
    return { userId: claims.userId };
  } catch {
    return { error: "invalid_token", status: 401 };
  }
}

export type PrivyFarcasterLink = {
  fid: number;
  username?: string;
};

/** Extract linked Farcaster account from Privy user linked accounts. */
function extractPrivyWalletAddresses(
  linkedAccounts: Array<{ type: string; address?: string }>,
): string[] {
  const out: string[] = [];
  for (const acct of linkedAccounts) {
    if (acct.type === "wallet" && typeof acct.address === "string") {
      out.push(acct.address.toLowerCase());
    }
  }
  return out;
}

/** Verify Bearer token and that walletAddress belongs to the Privy user. */
export async function requirePrivyWalletMatch(
  authorizationHeader: string | null,
  walletAddress: string,
): Promise<{ userId: string } | { error: string; status: number }> {
  const auth = await verifyPrivyAccessToken(authorizationHeader);
  if ("error" in auth) {
    return auth;
  }
  const privy = getPrivyClient();
  if (!privy) {
    return { error: "privy_not_configured", status: 503 };
  }
  try {
    const user = await privy.getUser(auth.userId);
    const wallets = extractPrivyWalletAddresses(user.linkedAccounts ?? []);
    const target = walletAddress.toLowerCase();
    if (!wallets.includes(target)) {
      return { error: "wallet_not_linked_to_privy", status: 403 };
    }
    return { userId: auth.userId };
  } catch {
    return { error: "privy_user_lookup_failed", status: 503 };
  }
}

export function isPrivyConfigured(): boolean {
  return (
    Boolean(process.env.PRIVY_APP_ID?.trim() || process.env.VITE_PRIVY_APP_ID?.trim()) &&
    Boolean(process.env.PRIVY_APP_SECRET?.trim())
  );
}

export async function getPrivyFarcasterLink(userId: string): Promise<PrivyFarcasterLink | null> {
  const privy = getPrivyClient();
  if (!privy) return null;
  try {
    const user = await privy.getUser(userId);
    const linked = user.linkedAccounts ?? [];
    for (const acct of linked) {
      if (acct.type === "farcaster") {
        const fid = Number((acct as { fid?: number }).fid);
        if (Number.isFinite(fid) && fid > 0) {
          return {
            fid,
            username: (acct as { username?: string }).username,
          };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}
