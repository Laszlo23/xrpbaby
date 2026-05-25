"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const STORAGE_KEY = "bc_pending_ref";

/** Stores ?ref= referral code for attach after SIWE sign-in. */
export function CommunityRefCapture() {
  const sp = useSearchParams();
  useEffect(() => {
    const ref = sp.get("ref");
    if (ref && ref.length >= 4) {
      try {
        sessionStorage.setItem(STORAGE_KEY, ref.trim().toLowerCase());
      } catch {
        /* ignore */
      }
    }
  }, [sp]);
  return null;
}

export function consumePendingRef(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v) sessionStorage.removeItem(STORAGE_KEY);
    return v;
  } catch {
    return null;
  }
}
