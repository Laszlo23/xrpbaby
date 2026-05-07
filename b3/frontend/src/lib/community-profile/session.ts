const KEY = "buildchain_profile_jwt";

export function getProfileJwt(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(KEY);
}

export function setProfileJwt(token: string | null): void {
  if (typeof sessionStorage === "undefined") return;
  if (!token) sessionStorage.removeItem(KEY);
  else sessionStorage.setItem(KEY, token);
}
