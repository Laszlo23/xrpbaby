import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { normalizeExplorerQuery } from "@/lib/explorer-query";

type LookupResponse =
  | { ok: true; type: "tx"; hash: string }
  | { ok: true; type: "address"; address: string; resolvedName?: string }
  | { ok: false; error: string; hint?: string };

export function ExplorerSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const normalized = useMemo(() => normalizeExplorerQuery(query), [query]);
  const canSubmit = normalized.length > 0 && !busy;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setHint(null);
    try {
      const res = await fetch(`/api/explorer/lookup?q=${encodeURIComponent(normalized)}`);
      const data = (await res.json()) as LookupResponse;
      if (data.ok && data.type === "tx") {
        await navigate({ to: "/explorer/tx/$hash", params: { hash: data.hash } });
      } else if (data.ok && data.type === "address") {
        await navigate({ to: "/explorer/address/$address", params: { address: data.address } });
      } else if (!data.ok) {
        setHint(
          data.hint ??
            "That doesn't look like a transaction, wallet address, or .culture name yet.",
        );
      }
    } catch {
      setHint("Search is unavailable right now — please try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;
    const clean = normalizeExplorerQuery(pasted);
    if (clean) {
      e.preventDefault();
      setQuery(clean);
      if (hint) setHint(null);
    }
  };

  return (
    <form onSubmit={submit} className="relative z-10 w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (hint) setHint(null);
            }}
            onPaste={onPaste}
            autoFocus={autoFocus}
            placeholder="Paste a transaction, wallet address, or .culture name…"
            className="h-12 rounded-full border-white/[0.12] bg-black/50 py-3 pl-11 pr-4 font-mono text-sm"
            aria-label="Search the explorer"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-12 shrink-0 cursor-pointer rounded-full bg-[var(--base-blue)] px-6 font-medium text-white hover:bg-[var(--base-blue)]/85 disabled:cursor-not-allowed"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Explain it"}
        </Button>
      </div>
      {hint ? <p className="mt-2 px-2 text-xs text-amber-300/90">{hint}</p> : null}
    </form>
  );
}
