"use client";

import { useIsMiniHost } from "@/hooks/useIsMiniHost";
import { MiniHome } from "./MiniHome";

export function MiniIndexGate({ children }: { children: React.ReactNode }) {
  const isMini = useIsMiniHost();
  if (isMini) return <MiniHome />;
  return children;
}
