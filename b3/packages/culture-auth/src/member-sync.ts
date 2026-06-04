import { DEFAULT_SYNC_API_ORIGIN } from "./env.js";

export type SyncMemberWalletInput = {
  walletAddress: string;
  accessToken: string;
  syncApiOrigin?: string;
};

export type SyncMemberWalletResult =
  | { ok: true; memberId: string; walletId: string }
  | { ok: false; error: string };

/** POST wallet + Privy user to the central Member API. */
export async function syncMemberWallet(
  input: SyncMemberWalletInput,
): Promise<SyncMemberWalletResult> {
  const origin = input.syncApiOrigin?.replace(/\/$/, "") || DEFAULT_SYNC_API_ORIGIN;
  const res = await fetch(`${origin}/api/wallet/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({ walletAddress: input.walletAddress }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    memberId?: string;
    walletId?: string;
  };

  if (!res.ok || !data.ok || !data.memberId || !data.walletId) {
    return { ok: false, error: data.error ?? `sync_failed_${res.status}` };
  }

  return { ok: true, memberId: data.memberId, walletId: data.walletId };
}

export type LogoutMemberSessionInput = {
  accessToken: string;
  syncApiOrigin?: string;
};

export async function syncMemberSocialScore(input: {
  walletAddress: string;
  accessToken: string;
  syncApiOrigin?: string;
}): Promise<{ ok: boolean; supportScore?: number; neynarScore?: number | null }> {
  const origin = input.syncApiOrigin?.replace(/\/$/, "") || DEFAULT_SYNC_API_ORIGIN;
  const url = new URL(`${origin}/api/social/sync-score`);
  url.searchParams.set("walletAddress", input.walletAddress);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { Authorization: `Bearer ${input.accessToken}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    supportScore?: number;
    neynarScore?: number | null;
  };
  if (!res.ok || !data.ok) return { ok: false };
  return { ok: true, supportScore: data.supportScore, neynarScore: data.neynarScore };
}

export type LinkFarcasterInput = {
  walletAddress: string;
  fid: number;
  signerUuid: string;
  accessToken: string;
  syncApiOrigin?: string;
};

export async function linkMemberFarcaster(
  input: LinkFarcasterInput,
): Promise<{ ok: boolean; error?: string; supportScore?: number }> {
  const origin = input.syncApiOrigin?.replace(/\/$/, "") || DEFAULT_SYNC_API_ORIGIN;
  const res = await fetch(`${origin}/api/social/link-farcaster`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      walletAddress: input.walletAddress,
      fid: input.fid,
      signerUuid: input.signerUuid,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    supportScore?: number;
  };
  if (!res.ok || !data.ok) return { ok: false, error: data.error ?? `link_failed_${res.status}` };
  return { ok: true, supportScore: data.supportScore };
}

export async function fetchNeynarAuthorizeUrl(
  syncApiOrigin?: string,
): Promise<string | null> {
  const origin = syncApiOrigin?.replace(/\/$/, "") || DEFAULT_SYNC_API_ORIGIN;
  const res = await fetch(`${origin}/api/social/neynar/authorize`);
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    authorization_url?: string;
  };
  if (!res.ok || !data.ok || !data.authorization_url) return null;
  return data.authorization_url;
}

export async function logoutMemberSession(input: LogoutMemberSessionInput): Promise<boolean> {
  const origin = input.syncApiOrigin?.replace(/\/$/, "") || DEFAULT_SYNC_API_ORIGIN;
  const res = await fetch(`${origin}/api/wallet/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
  return res.ok && Boolean(data.ok);
}
