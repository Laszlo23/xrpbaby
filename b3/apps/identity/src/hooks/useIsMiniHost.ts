"use client";

import { useEffect, useState } from "react";
import { isMiniAppContext } from "@/lib/mini/host";

export function useIsMiniHost(): boolean {
  const [isMini, setIsMini] = useState(false);

  useEffect(() => {
    setIsMini(isMiniAppContext());
  }, []);

  return isMini;
}
