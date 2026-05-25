import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { getSiweVerificationTransport, SIWE_DEFAULT_CHAIN_ID } from "@/lib/siwe-chain";
import { getPool } from "@/lib/db";
import { takeNonce } from "@/lib/siwe-store";
import { COOKIE_NAME, sessionCookieOptions, signSession } from "@/lib/web-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { message?: string; signature?: `0x${string}` };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  const { message, signature } = body;
  if (!message || !signature) {
    return Response.json({ error: "message and signature required" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = parseSiweMessage(message);
  } catch {
    return Response.json({ error: "invalid SIWE message" }, { status: 400 });
  }

  const parsedChainId = parsed.chainId != null ? Number(parsed.chainId) : NaN;
  const effectiveChainId =
    !Number.isNaN(parsedChainId) ? parsedChainId : SIWE_DEFAULT_CHAIN_ID;
  const { chain, rpcUrl } = getSiweVerificationTransport(effectiveChainId);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const okSig = await verifySiweMessage(publicClient, { message, signature });
  if (!okSig) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  if (!parsed.address || !parsed.nonce) {
    return Response.json({ error: "invalid message" }, { status: 400 });
  }

  const nonceOk = await takeNonce(parsed.address, parsed.nonce);
  if (!nonceOk) {
    return Response.json({ error: "nonce mismatch or expired" }, { status: 401 });
  }

  const pool = getPool();
  let userId: number | undefined;
  const addrLower = parsed.address.toLowerCase();
  if (pool) {
    const existing = await pool.query<{ user_id: number }>(
      `SELECT user_id FROM wallet_bindings WHERE address = $1`,
      [addrLower],
    );
    if (existing.rows.length === 0) {
      const userRes = await pool.query<{ id: number }>(`INSERT INTO users DEFAULT VALUES RETURNING id`);
      userId = userRes.rows[0].id;
      await pool.query(`INSERT INTO wallet_bindings (user_id, address) VALUES ($1, $2)`, [userId, addrLower]);
    } else {
      userId = existing.rows[0].user_id;
    }
  }

  const token = userId != null ? signSession(userId, parsed.address) : null;
  const sessionEstablished = Boolean(token);
  let sessionError: "missing_database" | "missing_session_secret" | undefined;
  if (!pool) {
    sessionError = "missing_database";
  } else if (userId != null && !token) {
    sessionError = "missing_session_secret";
  }
  if (process.env.NODE_ENV === "development" && pool && userId != null && !token) {
    console.warn("[siwe] User created but no session cookie: set SESSION_SECRET (16+ chars) in web/.env.local");
  }

  const res = NextResponse.json({
    ok: true,
    address: parsed.address,
    userId: userId ?? null,
    sessionEstablished,
    sessionError,
  });
  if (token) {
    res.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
  }
  return res;
}
