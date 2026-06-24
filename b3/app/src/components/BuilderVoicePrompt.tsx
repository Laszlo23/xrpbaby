import { Link } from "@tanstack/react-router";
import { MessageSquareQuote, X } from "lucide-react";
import { useEffect, useState } from "react";

const COOLDOWN_KEY = "bc_builder_voice_prompt_dismissed";
const COOLDOWN_MS = 7 * 86_400_000;

function inferArea(pathname: string): string {
  if (pathname.startsWith("/join") || pathname.startsWith("/welcome")) return "onboarding";
  if (pathname.startsWith("/marketplace")) return "marketplace";
  if (pathname.startsWith("/places")) return "places";
  if (pathname.startsWith("/tg")) return "tg";
  if (pathname.startsWith("/pass") || pathname.includes("identity")) return "identity";
  return "other";
}

export function BuilderVoicePrompt({ pathname }: { pathname: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname === "/voice" || pathname.startsWith("/pass")) return;
    const dismissed = Number(localStorage.getItem(COOLDOWN_KEY) ?? "0");
    if (Date.now() - dismissed < COOLDOWN_MS) return;

    const timer = window.setTimeout(() => setVisible(true), 60_000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  const area = inferArea(pathname);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md md:bottom-6 md:left-auto md:right-6">
      <div className="flex gap-3 rounded-2xl border border-gold-500/30 bg-zinc-950/95 p-4 shadow-xl backdrop-blur">
        <MessageSquareQuote className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Builder Voice</p>
          <p className="mt-1 text-xs text-zinc-400">
            Spotted something confusing? Specific feedback earns Culture Points — not &quot;all
            good.&quot;
          </p>
          <Link
            to="/voice"
            search={{ area }}
            className="mt-2 inline-block text-xs font-medium text-gold-300 underline underline-offset-2"
          >
            Share feedback →
          </Link>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="text-zinc-500 hover:text-white"
          onClick={() => {
            localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
