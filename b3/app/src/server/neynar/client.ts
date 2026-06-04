import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";

const NEYNAR_API_BASE = "https://api.neynar.com/v2";

export function getNeynarClient(): NeynarAPIClient | null {
  const key = process.env.NEYNAR_API_KEY?.trim();
  if (!key) return null;
  return new NeynarAPIClient(new Configuration({ apiKey: key }));
}

function neynarHeaders(): Record<string, string> {
  const key = process.env.NEYNAR_API_KEY?.trim();
  if (!key) throw new Error("neynar_not_configured");
  return { "x-api-key": key, accept: "application/json" };
}

export async function fetchNeynarAuthorizeUrl(): Promise<string> {
  const clientId = process.env.NEYNAR_CLIENT_ID?.trim();
  if (!clientId) throw new Error("neynar_client_id_unset");

  const url = new URL(`${NEYNAR_API_BASE}/farcaster/login/authorize/`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");

  const res = await fetch(url.toString(), { headers: neynarHeaders() });
  if (!res.ok) throw new Error("neynar_authorize_failed");
  const data = (await res.json()) as { authorization_url?: string; url?: string };
  const authUrl = data.authorization_url ?? data.url;
  if (!authUrl) throw new Error("neynar_authorize_missing_url");
  return authUrl;
}

export async function verifyNeynarSigner(fid: number, signerUuid: string): Promise<boolean> {
  const url = new URL(`${NEYNAR_API_BASE}/farcaster/signer/`);
  url.searchParams.set("signer_uuid", signerUuid);
  const res = await fetch(url.toString(), { headers: neynarHeaders() });
  if (!res.ok) throw new Error("neynar_signer_lookup_failed");
  const payload = (await res.json()) as { signer?: { fid?: number }; fid?: number };
  const signer = payload.signer ?? payload;
  const signerFid = signer.fid;
  if (signerFid == null) return false;
  return Number(signerFid) === Number(fid);
}

export async function fetchFarcasterUsername(fid: number): Promise<string | null> {
  const client = getNeynarClient();
  if (!client) return null;
  try {
    const res = await client.fetchBulkUsers({ fids: [fid] });
    return res.users[0]?.username ?? null;
  } catch {
    return null;
  }
}

export async function fetchNeynarUserByFid(fid: number): Promise<Record<string, unknown> | null> {
  const client = getNeynarClient();
  if (!client) return null;
  try {
    const res = await client.fetchBulkUsers({ fids: [fid] });
    const user = res.users[0];
    return user ? (user as unknown as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
