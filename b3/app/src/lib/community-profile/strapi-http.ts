import { getProfileJwt } from "@/lib/community-profile/session";
import {
  assertAllowedStrapiPath,
  proxyStrapiRequest,
} from "@/lib/community-profile/strapi-proxy-fn";
import { getStrapiBackendUrl } from "@/lib/community-profile/strapi-backend";

function normalizeApiPath(path: string): string {
  const p = path.trim();
  if (p.startsWith("/api/")) return p.slice("/api/".length);
  if (p.startsWith("api/")) return p.slice("api/".length);
  return p.replace(/^\/+/, "");
}

/**
 * JSON HTTP to Strapi: browser → server proxy; SSR → direct backend fetch.
 */
export async function strapiFetch(
  pathStartingWithApi: string,
  init: RequestInit = {},
): Promise<Response> {
  const pq = normalizeApiPath(pathStartingWithApi);
  assertAllowedStrapiPath(pq);

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const jwt = getProfileJwt();
  const existingAuth = headers.get("Authorization");
  const authorization = existingAuth ?? (jwt ? `Bearer ${jwt}` : undefined);

  const methodRaw = (init.method ?? "GET").toUpperCase();
  if (methodRaw !== "GET" && methodRaw !== "POST" && methodRaw !== "PUT") {
    throw new Error(`Unsupported Strapi method: ${methodRaw}`);
  }
  const method = methodRaw as "GET" | "POST" | "PUT";

  let bodyStr: string | undefined;
  if (method !== "GET" && init.body != null) {
    bodyStr = typeof init.body === "string" ? init.body : JSON.stringify(init.body);
  }

  if (typeof window === "undefined") {
    const base = getStrapiBackendUrl();
    const url = `${base}/api/${pq}`;
    const h = new Headers(headers);
    return fetch(url, { method, headers: h, body: method === "GET" ? undefined : bodyStr });
  }

  const result = await proxyStrapiRequest({
    data: {
      pathAndQuery: pq,
      method,
      body: bodyStr,
      authorization,
    },
  });

  return new Response(result.body, {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
}
