import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoiScenarioExplorer } from "@/components/investors/RoiScenarioExplorer";

const STORAGE_KEY = "bc_investor_workshop_token";

export function InvestorWorkshopGate() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "locked" | "open" | "unconfigured">("loading");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const verifyStoredToken = useCallback(async (stored: string) => {
    const res = await fetch("/api/investors/workshop/session", {
      headers: { Authorization: `Bearer ${stored}` },
    });
    const data = (await res.json()) as { ok?: boolean; enabled?: boolean; authorized?: boolean };
    if (data.enabled === false) {
      setStatus("unconfigured");
      return;
    }
    if (data.authorized) {
      setToken(stored);
      setStatus("open");
      return;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    setStatus("locked");
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      void fetch("/api/investors/workshop/session")
        .then((r) => r.json())
        .then((data: { enabled?: boolean }) => {
          setStatus(data.enabled === false ? "unconfigured" : "locked");
        })
        .catch(() => setStatus("locked"));
      return;
    }
    void verifyStoredToken(stored);
  }, [verifyStoredToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/investors/workshop/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        token?: string;
        error?: string;
        enabled?: boolean;
      };
      if (data.enabled === false) {
        setStatus("unconfigured");
        return;
      }
      if (!res.ok || !data.ok || !data.token) {
        setError(data.error === "invalid_password" ? "Incorrect password." : "Could not unlock.");
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
      setPassword("");
      setStatus("open");
    } catch {
      setError("Network error — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setStatus("locked");
  }

  if (status === "loading") {
    return (
      <p className="text-center text-sm text-zinc-500" aria-live="polite">
        Checking workshop access…
      </p>
    );
  }

  if (status === "unconfigured") {
    return (
      <aside className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-6 text-sm text-amber-100/90">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/90" aria-hidden />
          <div className="space-y-2">
            <p className="font-medium text-amber-50">Workshop not enabled on this deployment</p>
            <p className="text-amber-100/85">
              Set <code className="text-amber-50">INVESTOR_WORKSHOP_SECRET</code> in server env,
              redeploy, then share the password privately with advisors — never in public docs or
              grant forms.
            </p>
            <Link to="/investors" className="inline-block text-amber-200 underline underline-offset-4">
              ← Back to public investors page
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  if (status === "locked") {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <aside className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-sm text-amber-100/90">
          <div className="flex gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/90" aria-hidden />
            <p>
              <strong className="font-medium text-amber-50">Private advisor sandbox.</strong> Not
              indexed, not an offer. Password is shared in live calls only — not published on this
              site.
            </p>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="space-y-2">
            <Label htmlFor="workshop-password" className="text-zinc-400">
              Workshop password
            </Label>
            <Input
              id="workshop-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="From your BC advisor invite"
              className="border-white/10 bg-black/40"
            />
          </div>
          {error ? <p className="text-sm text-rose-300/90">{error}</p> : null}
          <Button type="submit" disabled={submitting || !password.trim()} className="w-full">
            {submitting ? "Unlocking…" : "Unlock sandbox"}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-600">
          Public audited metrics:{" "}
          <Link to="/investors" className="text-zinc-400 underline underline-offset-4">
            /investors
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-5 py-3 text-sm text-emerald-100/90">
        <span>
          <strong className="font-medium text-emerald-50">Unlocked</strong> — session only (this
          browser tab). Not a public round announcement.
        </span>
        <button
          type="button"
          onClick={signOut}
          className="font-mono text-[11px] uppercase tracking-wider text-emerald-200/80 underline-offset-4 hover:underline"
        >
          Lock
        </button>
      </div>
      {token ? <RoiScenarioExplorer /> : null}
    </div>
  );
}
