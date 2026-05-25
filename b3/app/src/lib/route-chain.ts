import { useRouterState } from "@tanstack/react-router";
import type { Chain } from "wagmi/chains";
import { getDefaultChain, getMarketplaceChain } from "@/lib/chains";

/** Expected wallet chain for the current route (marketplace → Base; otherwise app default). */
export function useRouteExpectedChain(): Chain {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/marketplace")) return getMarketplaceChain();
  return getDefaultChain();
}
