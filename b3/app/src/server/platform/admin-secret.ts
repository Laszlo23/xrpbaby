/** Shared ops/admin secret gate — fail closed when unset. */

export function requireOpsDashboardSecret(
  request: Request,
): { ok: true } | { ok: false; error: string; status: number } {
  const secret = process.env.OPS_DASHBOARD_SECRET?.trim();
  if (!secret) {
    return { ok: false, error: "admin_not_configured", status: 503 };
  }
  const header = request.headers.get("x-ops-dashboard-secret")?.trim();
  if (header !== secret) {
    return { ok: false, error: "unauthorized", status: 401 };
  }
  return { ok: true };
}

export function requirePlatformInternalSecret(
  request: Request,
): { ok: true } | { ok: false; error: string; status: number } {
  const secret = process.env.PLATFORM_INTERNAL_SECRET?.trim();
  if (!secret) {
    return { ok: false, error: "internal_not_configured", status: 503 };
  }
  const header = request.headers.get("x-platform-internal-secret")?.trim();
  if (header !== secret) {
    return { ok: false, error: "unauthorized", status: 401 };
  }
  return { ok: true };
}

export function requireEliasInboundSecret(
  request: Request,
): { ok: true } | { ok: false; error: string; status: number } {
  const expected = process.env.ELIAS_INBOUND_SECRET?.trim();
  if (!expected) {
    return { ok: false, error: "inbound_not_configured", status: 503 };
  }
  const hdr = request.headers.get("x-elias-inbound-secret")?.trim();
  if (hdr !== expected) {
    return { ok: false, error: "unauthorized", status: 401 };
  }
  return { ok: true };
}
