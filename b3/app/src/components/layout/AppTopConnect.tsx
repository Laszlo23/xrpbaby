import { useLocation } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { HeaderConnectButton } from "@/components/HeaderConnectButton";
import { privyEnabled } from "@/lib/privy-env";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";

function useHasLandingNav(): boolean {
  const { pathname } = useLocation();
  return (
    pathname === "/" ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/forest") ||
    pathname.startsWith("/ecosystem") ||
    pathname.startsWith("/studio")
  );
}

function useShowLoggedInShell(): boolean {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  if (!isConnected) return false;
  if (pathname === "/") return false;
  if (pathname.startsWith("/join")) return false;
  if (pathname.startsWith("/welcome")) return false;
  if (pathname.startsWith("/tg")) return false;
  if (pathname.startsWith("/intelligence")) return false;
  if (pathname.startsWith("/id")) return false;
  return true;
}

function useWalletLinked(): boolean {
  const { isConnected } = useAccount();
  const privyAddress = usePrivyWalletAddress();
  return privyEnabled ? Boolean(privyAddress) : isConnected;
}

/** Fixed top-right connect chip on routes without a full nav shell. */
export function AppTopConnect() {
  const { pathname } = useLocation();
  const hasLandingNav = useHasLandingNav();
  const showLoggedInShell = useShowLoggedInShell();
  const walletLinked = useWalletLinked();

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
