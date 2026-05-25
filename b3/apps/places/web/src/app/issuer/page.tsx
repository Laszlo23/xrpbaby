"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { keccak256, stringToBytes } from "viem";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";
import { encryptMetadataJson } from "@/lib/client-crypto";

export default function IssuerPage() {
  const { address, isConnected } = useAccount();
  const { registry } = useProtocolAddresses();
  const [parcelLabel, setParcelLabel] = useState("");
  const [metadataJson, setMetadataJson] = useState('{\n  "title": "",\n  "jurisdiction": ""\n}');
  const [passphrase, setPassphrase] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const externalRefHash =
    parcelLabel.length > 0 ? keccak256(stringToBytes(parcelLabel)) : null;

  async function submit() {
    if (!address) return;
    setBusy(true);
    setStatus(null);
    try {
      let encryptedBundle: string | undefined;
      if (passphrase.trim()) {
        encryptedBundle = await encryptMetadataJson(metadataJson, passphrase);
      }
      const res = await fetch("/api/issuer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          parcelLabel,
          metadataUri: metadataUri || undefined,
          encryptedBundle,
          notes: notes || undefined,
        }),
      });
      const j = (await res.json()) as { ok?: boolean; message?: string; encryptedBundle?: string };
      if (res.status === 202) {
        setStatus(
          j.message ??
            "Database not configured — metadata was not stored server-side. Keep your encrypted bundle offline."
        );
      } else if (res.ok) {
        setStatus("Application recorded. A registrar can anchor the property on-chain after legal review.");
      } else {
        setStatus("Request failed");
      }
    } catch {
      setStatus("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Issuer intake</h1>
      <p className="text-sm text-zinc-500">
        Submit a parcel label and optional public metadata URI. Encrypt sensitive JSON client-side with a
        passphrase before it is sent — the server stores only ciphertext. On-chain{" "}
        <span className="font-mono">registerProperty</span> requires <span className="font-mono">REGISTRAR_ROLE</span>{" "}
        on PropertyRegistry ({registry.slice(0, 10)}…).
      </p>

      {!isConnected && <p className="text-amber-400">Connect a wallet to associate this application.</p>}

      <div className="max-w-lg space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <label className="block text-xs text-zinc-500">
          Parcel label (off-chain id; used to derive keccak256 external ref for display)
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm"
            value={parcelLabel}
            onChange={(e) => setParcelLabel(e.target.value)}
            placeholder="e.g. US-CA-SF-12345"
          />
        </label>
        {externalRefHash && (
          <p className="font-mono text-[10px] text-zinc-500">externalRefHash: {externalRefHash}</p>
        )}

        <label className="block text-xs text-zinc-500">
          Public metadata URI (optional, e.g. IPFS after upload)
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm"
            value={metadataUri}
            onChange={(e) => setMetadataUri(e.target.value)}
            placeholder="ipfs://… or https://…"
          />
        </label>

        <label className="block text-xs text-zinc-500">
          Sensitive metadata (JSON) — encrypted in-browser if passphrase set
          <textarea
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm"
            rows={8}
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
          />
        </label>

        <label className="block text-xs text-zinc-500">
          Encryption passphrase (optional; never sent to server)
          <input
            type="password"
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="block text-xs text-zinc-500">
          Registrar notes (non-secret)
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <button
          type="button"
          disabled={!isConnected || !parcelLabel.trim() || busy}
          onClick={() => void submit()}
          className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          {busy ? "Submitting…" : "Submit application"}
        </button>
        {status && <p className="text-xs text-zinc-400">{status}</p>}
      </div>

      <div className="max-w-lg rounded-lg border border-zinc-800 p-4 text-xs text-zinc-500">
        <p className="font-medium text-zinc-300">Registrar flow (off this UI)</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Review intake and legal disclosure requirements (see docs/compliance.md).</li>
          <li>
            Call <span className="font-mono">registerProperty(keccak256(parcelId), metadataHash, recordOwner)</span>
          </li>
          <li>
            Call <span className="font-mono">createPropertyShare</span> on the share factory as registrar or record
            owner.
          </li>
          <li>Allowlist the new OgPair on ComplianceRegistry before secondary trading.</li>
        </ol>
      </div>
    </div>
  );
}
