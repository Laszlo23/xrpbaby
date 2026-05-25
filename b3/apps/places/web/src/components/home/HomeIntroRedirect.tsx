"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FIRST_VISIT_INTRO_STORAGE_KEY } from "@/lib/first-visit-intro";

/**
 * First-time visitors to `/` are sent to the immersive intro (`/experience`).
 * After they choose “Enter the full site”, `localStorage` is set and this no-ops.
 */
export function HomeIntroRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(FIRST_VISIT_INTRO_STORAGE_KEY) === "1") return;
      router.replace("/experience");
    } catch {
      /* storage blocked — skip redirect so users are not stuck re-entering intro */
    }
  }, [router]);

  return null;
}
