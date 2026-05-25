import { useEffect, useMemo, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { EliasIntentModal } from "@/components/EliasIntentModal";

const ONBOARDING_STORAGE_KEY = "bc_elias_onboarding_v1";

const BASE_REFERRAL_URL = "https://base.app/invite/friends/L0G97WP5";

function openEliasOrb() {
  window.dispatchEvent(new CustomEvent("bc_elias_orb_open"));
}

function routeNudge(pathname: string): { title: string; hint: string; cta?: string } | null {
  if (pathname === "/play") {
    return {
      title: "New here?",
      hint: `Open the quick onboarding to pick a lane (and optionally get Base app: ${BASE_REFERRAL_URL}).`,
      cta: "Open Elias",
    };
  }
  if (pathname.startsWith("/drops")) {
    return {
      title: "Drops",
      hint: "Ask Elias how tickets, odds, and settlement work for this drop.",
      cta: "Ask Elias",
    };
  }
  if (pathname.startsWith("/mission")) {
    return {
      title: "Mission",
      hint: "Ask Pulse Coach for a simple checklist for today (and how BCD fits).",
      cta: "Ask Elias",
    };
  }
  if (pathname.startsWith("/profile")) {
    return {
      title: "Profile",
      hint: "Connect your wallet to unlock XP + personalized guidance.",
      cta: "Ask Elias",
    };
  }
  if (pathname.startsWith("/elias")) return null;
  return null;
}

export function EliasOnboarding() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [hasShownNudge, setHasShownNudge] = useState(false);

  const nudge = useMemo(() => routeNudge(pathname), [pathname]);

  useEffect(() => {
    const existing = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (existing === "done") return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!nudge || hasShownNudge) return;
    const existing = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (existing === "done") return;
    setHasShownNudge(true);

    toast.message(nudge.title, {
      description: nudge.hint,
      action: nudge.cta
        ? {
            label: nudge.cta,
            onClick: openEliasOrb,
          }
        : undefined,
    });
  }, [nudge, hasShownNudge]);

  return (
    <EliasIntentModal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) localStorage.setItem(ONBOARDING_STORAGE_KEY, "done");
      }}
    />
  );
}
