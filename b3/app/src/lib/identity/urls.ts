import { getPublicAppOrigin } from "@/lib/app-origin";
import { parseIdentityFullName } from "@/lib/identity/tlds";

/** Canonical in-app profile path (culture layer namespace). */
export function cultureProfilePath(fullName: string): string {
  const parsed = parseIdentityFullName(fullName);
  const slug = parsed ? `${parsed.handle}.${parsed.tld}` : fullName.toLowerCase().trim();
  return `/id/${encodeURIComponent(slug)}`;
}

/** Short gateway path — same destination, easy to share. */
export function cultureGatewayPath(fullName: string): string {
  const parsed = parseIdentityFullName(fullName);
  const slug = parsed ? `${parsed.handle}.${parsed.tld}` : fullName.toLowerCase().trim();
  return `/n/${encodeURIComponent(slug)}`;
}

export function cultureProfileUrl(fullName: string): string {
  return `${getPublicAppOrigin()}${cultureProfilePath(fullName)}`;
}

export function cultureGatewayUrl(fullName: string): string {
  return `${getPublicAppOrigin()}${cultureGatewayPath(fullName)}`;
}
