import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Veriff POST /v1/sessions — includes callback for post-verification redirect to our site. */
function buildVerificationBody(vendorData: string, callback: string) {
  return {
    verification: {
      callback,
      person: {
        firstName: " ",
        lastName: " ",
      },
      vendorData,
      timestamp: new Date().toISOString(),
    },
  };
}

/** Where Veriff redirects the end-user after verification — must be on your HTTPS origin (not Veriff marketing pages). */
function getCallbackUrl(): string {
  const explicit = process.env.VERIFF_CALLBACK_URL?.trim();
  if (explicit) return explicit;
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim() || "https://buildingculture.capital";
  return `${site}/kyc`;
}

function getVeriffEnv() {
  const apiKey =
    process.env.VERIFF_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_VERIFF_API_KEY?.trim() ||
    "";
  const base =
    process.env.VERIFF_API_BASE?.replace(/\/$/, "").trim() ||
    process.env.NEXT_PUBLIC_VERIFF_HOST?.replace(/\/$/, "").trim() ||
    "https://api.veriff.me";
  const sharedSecret = process.env.VERIFF_SHARED_SECRET?.trim() || "";
  return { apiKey, base, sharedSecret };
}

function isStationBaseUrl(base: string): boolean {
  return base.includes("stationapi.veriff.com");
}

/**
 * Creates a Veriff session server-side (POST /v1/sessions).
 * Station API (`stationapi.veriff.com`) requires `VERIFF_SHARED_SECRET` and `x-hmac-signature` on the raw JSON body.
 * See https://devdocs.veriff.com/docs/hmac-authentication-and-endpoint-security
 */
export async function POST(req: NextRequest) {
  const { apiKey, base, sharedSecret } = getVeriffEnv();
  if (!apiKey) {
    return Response.json(
      { error: "Missing API key", hint: "Set VERIFF_API_KEY or NEXT_PUBLIC_VERIFF_API_KEY" },
      { status: 503 }
    );
  }

  if (isStationBaseUrl(base) && !sharedSecret) {
    return Response.json(
      {
        error: "Missing shared secret for Station API",
        hint: "Set VERIFF_SHARED_SECRET (master / signature key from Veriff Customer Portal). Station requires HMAC-SHA256 on the request body.",
      },
      { status: 503 }
    );
  }

  let body: { vendorData?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const vendorData = typeof body.vendorData === "string" ? body.vendorData.trim() : "";
  if (!vendorData) {
    return Response.json({ error: "vendorData is required" }, { status: 400 });
  }

  const callback = getCallbackUrl();
  const payload = buildVerificationBody(vendorData, callback);
  const bodyString = JSON.stringify(payload);
  const sessionUrl = `${base}/v1/sessions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-client": apiKey,
  };

  if (sharedSecret) {
    headers["x-hmac-signature"] = createHmac("sha256", sharedSecret).update(bodyString).digest("hex");
  }

  const res = await fetch(sessionUrl, {
    method: "POST",
    headers,
    body: bodyString,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    return Response.json(
      {
        error: "Veriff rejected the session request",
        httpStatus: res.status,
        httpStatusText: res.statusText,
        veriff: data,
        hint:
          res.status === 401
            ? "401: confirm API key, Base URL, and (for Station) VERIFF_SHARED_SECRET match one integration in Veriff Customer Portal. Verify HMAC signs the exact JSON body string."
            : undefined,
      },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
    );
  }

  const parsed = data as { verification?: { url?: string } };
  const url = parsed?.verification?.url;
  if (!url) {
    return Response.json(
      { error: "Veriff response missing verification.url", veriff: data },
      { status: 502 }
    );
  }

  return Response.json({ url, verification: parsed.verification });
}
