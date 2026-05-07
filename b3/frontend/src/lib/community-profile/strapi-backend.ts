/**
 * Strapi base URL for server-side requests (SSR + proxy handler).
 * Prefer STRAPI_URL in production (e.g. http://strapi:1337 on Docker); fall back to VITE_STRAPI_URL.
 */
export function getStrapiBackendUrl(): string {
  const raw =
    (typeof process !== "undefined" && process.env.STRAPI_URL?.trim()) ||
    (typeof process !== "undefined" && process.env.VITE_STRAPI_URL?.trim()) ||
    (import.meta.env.VITE_STRAPI_URL as string | undefined)?.trim();
  return (raw?.replace(/\/$/, "") || "http://127.0.0.1:1337").trim();
}
