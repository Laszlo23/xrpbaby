import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  postSelfExportPrivateKey,
  postSelfPollRegistrationStatus,
  postSelfRegenerateQr,
  postSelfStartRegistration,
} from "@/lib/self-agentid-fns";

export const Route = createFileRoute("/self/agentid")({
  head: () =>
    pageHead({
      title: "Self Agent ID",
      description: "Register an agent identity via Self and export keys (when allowed).",
      path: "/self/agentid",
      keywords: ["Self", "Agent ID", "registration", "qr"],
    }),
  component: SelfAgentIdPage,
});

type Mode = "wallet-free" | "linked";
type Network = "mainnet" | "testnet";

function pickString(obj: unknown, keys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
}

function pickAny(obj: unknown, keys: string[]): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    if (k in o) return o[k];
  }
  return undefined;
}

function normalizeStartResponse(payload: unknown): {
  token: string | null;
  deepLink: string | null;
  scanUrl: string | null;
  qrImageUrl: string | null;
  qrData: unknown;
} {
  const token = pickString(payload, ["token", "sessionToken", "session_token"]);
  const deepLink = pickString(payload, ["deepLink", "deeplink", "deep_link", "url"]);
  const scanUrl = pickString(payload, ["scanUrl", "scan_url"]);
  const qrImageUrl = pickString(payload, ["qrImageUrl", "qr_image_url", "qrUrl", "qr_url"]);
  const qrData = pickAny(payload, ["qrData", "qr_data", "qr", "qrPayload", "data"]) ?? payload;
  return { token, deepLink, scanUrl, qrImageUrl, qrData };
}

function SelfAgentIdPage() {
  const start = useServerFn(postSelfStartRegistration);
  const poll = useServerFn(postSelfPollRegistrationStatus);
  const regenQr = useServerFn(postSelfRegenerateQr);
  const exportKey = useServerFn(postSelfExportPrivateKey);

  const [mode, setMode] = useState<Mode>("wallet-free");
  const [network, setNetwork] = useState<Network>("mainnet");
  const [humanAddress, setHumanAddress] = useState("");

  const [token, setToken] = useState<string | null>(null);
  const [startPayload, setStartPayload] = useState<unknown>(null);
  const [statusPayload, setStatusPayload] = useState<unknown>(null);
  const [exportPayload, setExportPayload] = useState<unknown>(null);

  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingPoll, setLoadingPoll] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const pollTimer = useRef<number | null>(null);

  const normalized = useMemo(() => normalizeStartResponse(startPayload), [startPayload]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) window.clearInterval(pollTimer.current);
    };
  }, []);

  async function onStart() {
    setExportPayload(null);
    setStatusPayload(null);
    setStartPayload(null);
    setToken(null);
    setLoadingStart(true);
    try {
      const input: {
        mode: "wallet-free" | "linked";
        network: Network;
        humanAddress?: string;
      } = { mode, network };
      if (mode === "linked") {
        const addr = humanAddress.trim();
        const ok = z
          .string()
          .regex(/^0x[0-9a-fA-F]{40}$/)
          .safeParse(addr).success;
        if (!ok) {
          toast.error("Enter a valid 0x… human address for linked mode.");
          return;
        }
        input.humanAddress = addr;
      }
      const r = await start({ data: input });
      setStartPayload(r);
      const data = (r as { ok?: boolean; data?: unknown }).ok ? (r as { data?: unknown }).data : r;
      const n = normalizeStartResponse(data);
      if (n.token) {
        setToken(n.token);
        toast.success("Registration session created.");
      } else {
        toast.message("Session created (token not found in response). See raw response below.");
      }
    } finally {
      setLoadingStart(false);
    }
  }

  async function onPollOnce() {
    if (!token) {
      toast.error("No session token yet.");
      return;
    }
    setLoadingPoll(true);
    try {
      const r = await poll({ data: { token } });
      setStatusPayload(r);
    } finally {
      setLoadingPoll(false);
    }
  }

  function onToggleAutoPoll() {
    if (!token) {
      toast.error("No session token yet.");
      return;
    }
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
      toast.message("Auto-poll stopped.");
      return;
    }
    void onPollOnce();
    pollTimer.current = window.setInterval(() => {
      void onPollOnce();
    }, 2000);
    toast.message("Auto-poll started (2s).");
  }

  async function onRegenerateQr() {
    if (!token) {
      toast.error("No session token yet.");
      return;
    }
    const r = await regenQr({ data: { token } });
    setStartPayload(r);
    toast.message("QR regenerated.");
  }

  async function onExport() {
    if (!token) {
      toast.error("No session token yet.");
      return;
    }
    setLoadingExport(true);
    try {
      const r = await exportKey({ data: { token } });
      setExportPayload(r);
    } finally {
      setLoadingExport(false);
    }
  }

  return (
    <MarketingShell
      eyebrow="Agent bootstrap"
      tone="slate"
      title={<>Self Agent ID</>}
      subtitle="Start a registration session, scan the QR in the Self app, poll until registered, then export the agent key (only for wallet-free / linked server-generated keys)."
      articleClassName="max-w-4xl"
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Mode
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant={mode === "wallet-free" ? "default" : "outline"}
                  onClick={() => setMode("wallet-free")}
                >
                  wallet-free
                </Button>
                <Button
                  type="button"
                  variant={mode === "linked" ? "default" : "outline"}
                  onClick={() => setMode("linked")}
                >
                  linked
                </Button>
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Network
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant={network === "mainnet" ? "default" : "outline"}
                  onClick={() => setNetwork("mainnet")}
                >
                  mainnet
                </Button>
                <Button
                  type="button"
                  variant={network === "testnet" ? "default" : "outline"}
                  onClick={() => setNetwork("testnet")}
                >
                  testnet
                </Button>
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Human address (linked)
              </p>
              <Input
                value={humanAddress}
                onChange={(e) => setHumanAddress(e.target.value)}
                placeholder="0x…"
                className="mt-2 font-mono"
                disabled={mode !== "linked"}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void onStart()} disabled={loadingStart}>
              {loadingStart ? "Starting…" : "Start registration"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void onRegenerateQr()}
              disabled={!token}
            >
              Regenerate QR
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">Session</p>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4 font-mono text-[12px] text-zinc-200 break-all">
                {token ?? "—"}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Keep this token private. It can allow exporting the agent key for server-generated
                modes.
              </p>
            </div>
            <div>
              <div className="space-y-2">
                {normalized.deepLink ? (
                  <a href={normalized.deepLink} target="_blank" rel="noreferrer noopener">
                    Open deep link →
                  </a>
                ) : null}
                {normalized.scanUrl ? (
                  <a href={normalized.scanUrl} target="_blank" rel="noreferrer noopener">
                    Open scan URL →
                  </a>
                ) : null}
                {normalized.qrImageUrl ? (
                  <a href={normalized.qrImageUrl} target="_blank" rel="noreferrer noopener">
                    Open QR image →
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-zinc-400">
              Raw start/QR response
            </summary>
            <pre className="mt-2 overflow-auto rounded-xl border border-white/[0.08] bg-black/35 p-4 text-[11px] text-zinc-200">
              {JSON.stringify(startPayload, null, 2)}
            </pre>
          </details>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void onPollOnce()}
              disabled={!token || loadingPoll}
            >
              {loadingPoll ? "Polling…" : "Poll once"}
            </Button>
            <Button type="button" variant="outline" onClick={onToggleAutoPoll} disabled={!token}>
              Toggle auto-poll (2s)
            </Button>
          </div>
          <pre className="mt-4 overflow-auto rounded-xl border border-white/[0.08] bg-black/35 p-4 text-[11px] text-zinc-200">
            {JSON.stringify(statusPayload, null, 2)}
          </pre>
        </section>

        <section className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.07] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-200/80">
            Export key (sensitive)
          </p>
          <p className="mt-2 text-sm text-amber-100/90">
            Only works for modes where the server generated the keypair (typically{" "}
            <span className="font-mono">wallet-free</span> and{" "}
            <span className="font-mono">linked</span>). Treat exported keys as secrets.
          </p>
          <div className="mt-3">
            <Button
              type="button"
              onClick={() => void onExport()}
              disabled={!token || loadingExport}
            >
              {loadingExport ? "Exporting…" : "Export private key"}
            </Button>
          </div>
          <pre className="mt-4 overflow-auto rounded-xl border border-amber-500/25 bg-black/35 p-4 text-[11px] text-amber-50">
            {JSON.stringify(exportPayload, null, 2)}
          </pre>
        </section>
      </div>
    </MarketingShell>
  );
}
