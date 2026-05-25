import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { ensureReferralCode, ensureUserProfile, getProfileByUserId, getWalletForUser } from "@/lib/community-queries";
import { getSessionFromCookies } from "@/lib/get-session";
export const dynamic = "force-dynamic";

const RESERVED_SLUGS = new Set([
  "api",
  "admin",
  "community",
  "profile",
  "u",
  "properties",
  "trade",
  "pool",
  "stake",
  "portfolio",
  "invest",
  "guide",
  "legal",
  "contracts",
  "blog",
  "feedback",
]);

const PATCH_KEYS = new Set([
  "visibility",
  "display_name",
  "bio",
  "show_holdings",
  "twitter",
  "discord",
  "farcaster",
  "telegram",
  "linkedin",
  "website",
  "public_slug",
  "extra_wallets",
]);

function sanitizeProfilePatch(body: unknown): { patch: Record<string, unknown>; error?: string } {
  if (!body || typeof body !== "object") return { patch: {}, error: "invalid_body" };
  const b = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if (typeof b.visibility === "string" && (b.visibility === "private" || b.visibility === "public")) {
    out.visibility = b.visibility;
  }
  if (b.display_name === null || typeof b.display_name === "string") {
    out.display_name = typeof b.display_name === "string" ? b.display_name.slice(0, 80) : null;
  }
  if (b.bio === null || typeof b.bio === "string") {
    out.bio = typeof b.bio === "string" ? b.bio.slice(0, 2000) : null;
  }
  if (typeof b.show_holdings === "boolean") out.show_holdings = b.show_holdings;
  for (const key of ["twitter", "discord", "farcaster", "telegram", "linkedin", "website"] as const) {
    if (b[key] === null || typeof b[key] === "string") {
      out[key] = typeof b[key] === "string" ? b[key].slice(0, 200) : null;
    }
  }
  if (b.public_slug !== undefined) {
    if (b.public_slug === null) {
      out.public_slug = null;
    } else if (typeof b.public_slug === "string") {
      const s = b.public_slug.toLowerCase().trim();
      if (s.length > 0 && (s.length < 3 || s.length > 32 || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s))) {
        return { patch: {}, error: "invalid_public_slug" };
      }
      if (s.length > 0 && RESERVED_SLUGS.has(s)) {
        return { patch: {}, error: "reserved_public_slug" };
      }
      out.public_slug = s.length > 0 ? s : null;
    }
  }
  if (Array.isArray(b.extra_wallets)) {
    const clean = b.extra_wallets.slice(0, 5).flatMap((x) => {
      if (!x || typeof x !== "object") return [];
      const o = x as Record<string, unknown>;
      const addr = typeof o.address === "string" ? o.address.slice(0, 42) : "";
      const label = typeof o.label === "string" ? o.label.slice(0, 40) : "";
      if (!addr.startsWith("0x")) return [];
      return [{ address: addr, label }];
    });
    out.extra_wallets = clean;
  }
  return { patch: out };
}

function stripProfileUserId<T extends { user_id?: number }>(profile: T | null): Omit<T, "user_id"> | null {
  if (!profile) return null;
  const s = { ...profile } as Record<string, unknown>;
  delete s.user_id;
  return s as Omit<T, "user_id">;
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized", profile: null }, { status: 401 });
  }
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: "database_unconfigured", profile: null, address: session.address }, { status: 503 });
  }
  try {
    await ensureUserProfile(pool, session.userId);
    const profile = await getProfileByUserId(pool, session.userId);
    const primaryWallet = await getWalletForUser(pool, session.userId);
    let referralCode: string | undefined;
    let referralLink: string | undefined;
    try {
      const code = await ensureReferralCode(pool, session.userId);
      referralCode = code;
      const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
      if (origin) referralLink = `${origin}/community?ref=${encodeURIComponent(code)}`;
    } catch {
      /* optional */
    }
    return NextResponse.json({
      address: primaryWallet ?? session.address,
      profile: stripProfileUserId(profile),
      referralCode,
      referralLink,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "query failed";
    return NextResponse.json({ error: msg, profile: null }, { status: 503 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: "database_unconfigured" }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { patch, error: sanErr } = sanitizeProfilePatch(body);
  if (sanErr) {
    return NextResponse.json({ error: sanErr }, { status: 400 });
  }
  try {
    await ensureUserProfile(pool, session.userId);
    const fields: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || !PATCH_KEYS.has(k)) continue;
      fields.push(`${k} = $${i++}`);
      vals.push(v);
    }
    if (fields.length === 0) {
      const profile = await getProfileByUserId(pool, session.userId);
      return NextResponse.json({ profile: stripProfileUserId(profile) });
    }
    fields.push(`updated_at = NOW()`);
    vals.push(session.userId);
    await pool.query(`UPDATE user_profiles SET ${fields.join(", ")} WHERE user_id = $${i}`, vals);
    const profile = await getProfileByUserId(pool, session.userId);
    return NextResponse.json({ profile: stripProfileUserId(profile) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "update failed";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "slug_or_field_conflict" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
