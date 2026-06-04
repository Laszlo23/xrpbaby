import { useRouterState } from "@tanstack/react-router";
import type { Chain } from "wagmi/chains";
import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import { getDefaultChain, getMarketplaceChain } from "@/lib/chains";

function usePathname(): string {
  return useRouterState({ select: (s) => s.location.pathname });
}

function isIdentityRoute(pathname: string): boolean {
  return pathname.startsWith("/pass") || pathname.startsWith("/wallet");
}

/** Expected wallet chain for the current route (marketplace → Base; pass/wallet → active identity network). */
export function useRouteExpectedChain(): Chain {
  const pathname = usePathname();
  const { identity } = useCultureNetwork();

  if (pathname.startsWith("/marketplace")) return getMarketplaceChain();
  if (isIdentityRoute(pathname)) return identity.identityChain;
  return getDefaultChain();
}
