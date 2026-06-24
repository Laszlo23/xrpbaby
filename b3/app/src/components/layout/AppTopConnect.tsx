import { useLocation } from "@tanstack/react-router";
import { HeaderConnectButton } from "@/components/HeaderConnectButton";
import { useHasLandingNav, useShowLoggedInShell } from "@/hooks/useShowLoggedInShell";
import { useWalletSession } from "@/hooks/useWalletSession";

/** Fixed top-right connect chip on routes without a full nav shell. */
export function AppTopConnect() {
  const { pathname } = useLocation();
  const hasLandingNav = useHasLandingNav();
  const showLoggedInShell = useShowLoggedInShell();
  const walletLinked = useWalletSession().wasConnected;

  if (pathname === "/tg" || pathname === "/tg/") return null;
  if (showLoggedInShell) return null;
  if (hasLandingNav) return null;
  if (pathname.startsWith("/join")) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[70] flex justify-end pt-[env(safe-area-inset-top)] sm:right-6"
      aria-label={walletLinked ? "Wallet account" : "Connect wallet"}
    >
      <div className="pointer-events-auto">
        <HeaderConnectButton />
      </div>
    </div>
  );
}
