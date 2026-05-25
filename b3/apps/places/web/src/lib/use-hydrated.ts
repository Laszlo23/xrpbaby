"use client";

import { useEffect, useState } from "react";

/** True only after the browser has mounted — use to avoid SSR/client HTML mismatches for wallet/chain state. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
