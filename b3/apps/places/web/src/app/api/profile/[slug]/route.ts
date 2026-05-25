import { NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import { getPool } from "@/lib/db";
import { ensureUserProfile, getProfileByUserId, getWalletForUser } from "@/lib/community-queries";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug: raw } = await ctx.params;
  const slug = decodeURIComponent(raw || "").trim();
  if (!slug) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: "database_unconfigured" }, { status: 503 });
  }
  try {
    let userId: number | null = null;

    if (isAddress(slug)) {
      const addr = getAddress(slug).toLowerCase();
      const wb = await pool.query<{ user_id: number }>(
        `SELECT user_id FROM wallet_bindings WHERE address = $1`,
        [addr],
      );
      if (wb.rows.length === 0) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      userId = wb.rows[0].user_id;
    } else {
      const lower = slug.toLowerCase();
      const byCode = await pool.query<{ user_id: number }>(
        `SELECT user_id FROM referral_codes WHERE code = $1`,
        [lower],
      );
      if (byCode.rows.length > 0) {
        userId = byCode.rows[0].user_id;
      } else {
        const bySlug = await pool.query<{ user_id: number }>(
          `SELECT user_id FROM user_profiles WHERE public_slug = $1 AND visibility = 'public'`,
          [lower],
        );
        if (bySlug.rows.length > 0) {
          userId = bySlug.rows[0].user_id;
        }
      }
    }

    if (userId == null) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    await ensureUserProfile(pool, userId);
    const profile = await getProfileByUserId(pool, userId);
    if (!profile || profile.visibility !== "public") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const primaryWallet = await getWalletForUser(pool, userId);
    const publicProfile = { ...profile } as Record<string, unknown>;
    delete publicProfile.user_id;
    return NextResponse.json({
      profile: {
        ...publicProfile,
        primary_wallet: primaryWallet,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "query failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
