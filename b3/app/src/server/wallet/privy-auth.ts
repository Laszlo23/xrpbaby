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
