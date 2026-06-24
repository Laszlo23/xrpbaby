import { useLocation } from "@tanstack/react-router";

import { useWalletSession } from "@/hooks/useWalletSession";

/** Hub header (LoggedInShell) replaces LandingNav on these routes when wallet is linked. */
export function useShowLoggedInShell(): boolean {
  const { pathname } = useLocation();
  const { wasConnected } = useWalletSession();
  if (!wasConnected) return false;
  if (pathname === "/") return false;
  if (pathname.startsWith("/welcome")) return false;
  if (pathname.startsWith("/tg")) return false;
  if (pathname.startsWith("/intelligence")) return false;
  if (pathname.startsWith("/id")) return false;
  return true;
}

/** Routes that embed LandingNav in the page (not the homepage). */
export function useHasLandingNav(): boolean {
  const { pathname } = useLocation();
  return (
    pathname === "/" ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/forest") ||
    pathname.startsWith("/ecosystem") ||
    pathname.startsWith("/studio")
  );
}
