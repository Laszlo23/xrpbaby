import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type Health = {
  ok?: boolean;
  reachable?: boolean;
  message?: string;
};

export function TradingAgentHealthBanner() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/trading/health")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setHealth(json as Health);
      })
      .catch(() => {
        if (!cancelled) setHealth({ ok: false, reachable: false });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Checking trading sidecar…
      </p>
    );
  }

  const online = health?.reachable === true || health?.ok === true;

  return (
    <div
      className={`flex flex-wrap items-start gap-3 rounded-2xl border p-4 ${
        online
          ? "border-emerald-500/25 bg-emerald-500/[0.06]"
          : "border-amber-500/25 bg-amber-500/[0.06]"
      }`}
    >
      {online ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-200">
          Trading sidecar: {online ? "online" : "offline (read-only quotes via app API)"}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {online
            ? "x402 micropay quotes and Aerodrome routing are reachable."
            : "Deploy packages/trading-agent to restore live quotes. Premium x402 endpoints on this host still work for manifest discovery."}
        </p>
        {!online ? (
          <Link to="/grant-proof" className="mt-2 inline-block text-xs text-[#C5FF41] underline">
            Grant verifier tracks sidecar status →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
