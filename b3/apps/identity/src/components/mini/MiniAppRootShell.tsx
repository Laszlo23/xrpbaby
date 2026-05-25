"use client";

import { useIsMiniHost } from "@/hooks/useIsMiniHost";
import { MiniAppShell } from "./MiniAppShell";

export function MiniAppRootShell({ children }: { children: React.ReactNode }) {
  const isMini = useIsMiniHost();
  if (!isMini) return children;
  return <MiniAppShell>{children}</MiniAppShell>;
}
