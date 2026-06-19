import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { ModuleShell } from "@/components/ModuleShell";

type OutreachTouch = {
  id: string;
  channel: string;
  status: string;
  emailSubject: string | null;
  emailBody: string | null;
  forumPost: string | null;
  followUpVariants: string[] | null;
  grantProofUrl: string | null;
  sentAt: string | null;
  createdAt: string;
};

type OutreachTarget = {
  id: string;
  name: string;
  segment: string;
  channel: string;
  contactEmail: string | null;
  contactUrl: string | null;
  status: string;
  notes: string | null;
  grantProofUrl: string | null;
  touches: OutreachTouch[];
};

type Board = {
  ok: boolean;
  targets?: OutreachTarget[];
  error?: string;
};

export const Route = createFileRoute("/ops/outreach")({
  component: OpsOutreachPage,
});

function OpsOutreachPage() {
  const [secret, setSecret] = useState("");
  const [storedSecret, setStoredSecret] = useState("");
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedTouch, setSelectedTouch] = useState<OutreachTouch | null>(null);

  const headers = useCallback((): Record<string, string> => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (storedSecret) h["x-ops-dashboard-secret"] = storedSecret;
    return h;
  }, [storedSecret]);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/ops/outreach/", { headers: headers() });
    const json = (await res.json()) as Board;
    if (!res.ok) {
      setError(json.error ?? `HTTP ${res.status}`);
      setBoard(null);
      return;
    }
    setBoard(json);
  }, [headers]);

  useEffect(() => {
    void load();
  }, [load]);

  async function draftForTarget(targetId: string) {
    setBusy(targetId);
    setError(null);
    try {
      const res = await fetch("/api/ops/outreach/draft", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ targetId }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(json.error ?? `draft HTTP ${res.status}`);
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function sendTouch(touchId: string) {
    if (!confirm("Send this email via Resend from hello@buildingcultureid.space?")) return;
    setBusy(touchId);
    setError(null);
    try {
      const res = await fetch("/api/ops/outreach/send", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ touchId, sentBy: "ops-dashboard" }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; resendId?: string };
      if (!res.ok) {
        setError(json.error ?? `send HTTP ${res.status}`);
        return;
      }
      await load();
      setSelectedTouch(null);
    } finally {
      setBusy(null);
    }
  }

  const targets = board?.targets ?? [];

  return (
    <ModuleShell
      moduleId="signal"
      title="Outreach CRM"
      subtitle="Agent drafts · human approves · Resend from hello@buildingcultureid.space"
    >
      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-6">
        <p className="text-sm text-zinc-400">
          No autonomous cold email — review every draft before send. Forum posts can be copied
          manually. Set <code className="text-zinc-300">OPS_DASHBOARD_SECRET</code> and{" "}
          <code className="text-zinc-300">RESEND_API_KEY</code>.
        </p>

        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStoredSecret(secret.trim());
          }}
        >
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Ops secret
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="OPS_DASHBOARD_SECRET"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Authenticate
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
          >
            Refresh
          </button>
        </form>

        {error ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {targets.map((t) => {
            const latest = t.touches[0];
            return (
              <article key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-zinc-100">{t.name}</h2>
                    <p className="text-xs text-zinc-500">
                      {t.segment} · {t.status} · {t.contactEmail ?? "no email"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy === t.id}
                    onClick={() => void draftForTarget(t.id)}
                    className="shrink-0 rounded-lg border border-emerald-700/50 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/40 disabled:opacity-50"
                  >
                    {busy === t.id ? "Drafting…" : "Agent draft"}
                  </button>
                </div>
                {t.contactUrl ? (
                  <a
                    href={t.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block truncate text-xs text-zinc-500 underline"
                  >
                    {t.contactUrl}
                  </a>
                ) : null}
                {latest ? (
                  <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
                    <p className="text-xs text-zinc-500">
                      Latest touch: {latest.status} · {latest.channel}
                    </p>
                    {latest.emailSubject ? (
                      <p className="text-sm font-medium text-zinc-300">{latest.emailSubject}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTouch(latest)}
                        className="text-xs text-zinc-400 underline hover:text-zinc-200"
                      >
                        Preview
                      </button>
                      {latest.status === "draft" && t.contactEmail ? (
                        <button
                          type="button"
                          disabled={busy === latest.id}
                          onClick={() => void sendTouch(latest.id)}
                          className="text-xs text-emerald-400 underline hover:text-emerald-200 disabled:opacity-50"
                        >
                          Approve & send
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-zinc-600">No touches yet.</p>
                )}
              </article>
            );
          })}
        </div>

        {selectedTouch ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl border border-zinc-700 bg-zinc-950 p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Touch preview</h3>
              {selectedTouch.emailSubject ? (
                <p className="mb-2 text-sm font-medium text-zinc-300">
                  Subject: {selectedTouch.emailSubject}
                </p>
              ) : null}
              {selectedTouch.emailBody ? (
                <pre className="mb-4 whitespace-pre-wrap rounded-lg bg-zinc-900 p-3 text-xs text-zinc-400">
                  {selectedTouch.emailBody}
                </pre>
              ) : null}
              {selectedTouch.forumPost ? (
                <>
                  <p className="mb-1 text-xs font-medium text-zinc-500">Forum post</p>
                  <pre className="mb-4 whitespace-pre-wrap rounded-lg bg-zinc-900 p-3 text-xs text-zinc-400">
                    {selectedTouch.forumPost}
                  </pre>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedTouch(null)}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </ModuleShell>
  );
}
