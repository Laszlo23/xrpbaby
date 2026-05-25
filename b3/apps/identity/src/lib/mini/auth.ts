import { createClient } from "@farcaster/quick-auth";
import { MINI_APP_HOST } from "./site";

const authClient = createClient();

export type AuthenticatedFid = {
  fid: number;
  token: string;
};

export async function verifyQuickAuthRequest(
  request: Request,
): Promise<AuthenticatedFid | null> {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice(7).trim();
  if (!token) return null;

  try {
    const payload = await authClient.verifyJwt({
      token,
      domain: MINI_APP_HOST,
    });

    const sub = payload.sub;
    const fid =
      typeof sub === "string"
        ? Number.parseInt(sub, 10)
        : typeof sub === "number"
          ? sub
          : NaN;

    if (!Number.isFinite(fid) || fid <= 0) return null;

    return { fid, token };
  } catch {
    return null;
  }
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
