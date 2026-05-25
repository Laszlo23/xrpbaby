"use client";

import { useIsMiniHost } from "@/hooks/useIsMiniHost";

export function MiniRouteGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const isMini = useIsMiniHost();
  if (!isMini) return fallback;
  return children;
}
