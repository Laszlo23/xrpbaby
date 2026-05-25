import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getStrapiBackendUrl } from "@/lib/community-profile/strapi-backend";

const inputSchema = z.object({
  pathAndQuery: z.string().min(1).max(8000),
  method: z.enum(["GET", "POST", "PUT"]),
  body: z.string().optional(),
  authorization: z.string().optional(),
});

/** Only community-profile REST — avoids open SSRF. */
export function assertAllowedStrapiPath(pathAndQuery: string): void {
  const pathOnly = (pathAndQuery.split("?")[0] ?? "").replace(/^\/+/, "");
  if (!pathOnly.startsWith("community-profiles")) {
    throw new Error("strapi_proxy_path_not_allowed");
  }
}

/**
 * Same-origin Strapi proxy for the browser (avoids CORS / wrong host).
 * Called only from the client; SSR uses direct fetch in strapi-http.ts.
 */
export const proxyStrapiRequest = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => inputSchema.parse(raw))
  .handler(async ({ data }) => {
    assertAllowedStrapiPath(data.pathAndQuery);
    const base = getStrapiBackendUrl();
    const url = `${base}/api/${data.pathAndQuery.replace(/^\/+/, "")}`;
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (data.authorization) headers.set("Authorization", data.authorization);
    const res = await fetch(url, {
      method: data.method,
      headers,
      body: data.method === "GET" ? undefined : data.body,
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  });
