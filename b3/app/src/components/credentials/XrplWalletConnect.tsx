"use client";

import { useCallback, useEffect, useState } from "react";

import {
  crossmarkInstalled,
  crossmarkSignIn,
  crossmarkSignLinkProof,
} from "@/lib/crossmark-client";
import { isValidXrplAddress } from "@/lib/credentials/xrpl-address";
import { useCultureSiweSession } from "@/hooks/useCultureSiweSession";

type XrplWalletConnectProps = {
  handle: string;
  onLinked?: () => void;
};

type WizardStep = "evm" | "connect" | "sign" | "done";

export function XrplWalletConnect({ handle, onLinked }: XrplWalletConnectProps) {
  const { address, ensureSession, session, signing } = useCultureSiweSession();
  const [step, setStep] = useState<WizardStep>("evm");
  const [xrplAddress, setXrplAddress] = useState("");
  const [nonce, setNonce] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState("");
  const [xrplSignature, setXrplSignature] = useState("");
  const [txBlob, setTxBlob] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [hasCrossmark, setHasCrossmark] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setHasCrossmark(crossmarkInstalled());
  }, []);

  const requestChallenge = useCallback(
    async (siwe: { address: string; message: string; signature: string }, xrpl: string) => {
      const res = await fetch("/api/credentials/xrpl/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          address: siwe.address,
          message: siwe.message,
          signature: siwe.signature,
          xrplAddress: xrpl,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        nonce?: string;
        message?: string;
        error?: string;
      };
      if (!data.ok || !data.nonce) {
        throw new Error(data.error ?? "challenge_failed");
      }
      setNonce(data.nonce);
      setMessage(data.message ?? null);
      return data.nonce;
    },
    [handle],
  );

  async function proveEvmAndContinue() {
    setPending(true);
    setStatus(null);
    try {
      await ensureSession(`Link XRPL wallet to Culture ID ${handle}.`);
      setStep("connect");
    } catch {
      setStatus("Connect your EVM wallet and sign to prove Culture ID ownership.");
    } finally {
      setPending(false);
    }
  }

  async function connectCrossmark() {
    setPending(true);
    setStatus(null);
    try {
      const linked = await crossmarkSignIn();
      if (!linked || !isValidXrplAddress(linked)) {
        setStatus("Crossmark not detected or sign-in cancelled.");
        return;
      }
      setXrplAddress(linked);
      setManualMode(false);
      setStep("sign");
    } catch {
      setStatus("Crossmark connection failed.");
    } finally {
      setPending(false);
    }
  }

  async function continueWithManualAddress() {
    if (!isValidXrplAddress(xrplAddress)) {
      setStatus("Enter a valid XRPL address (starts with r).");
      return;
    }
    setManualMode(true);
    setStep("sign");
  }

  async function signWithCrossmark() {
    if (!session || !nonce) return;
    setPending(true);
    setStatus(null);
    try {
      const blob = await crossmarkSignLinkProof(xrplAddress, nonce);
      if (!blob) {
        setStatus("Crossmark signing cancelled.");
        return;
      }
      await submitLink({ txBlob: blob });
    } catch {
      setStatus("Crossmark sign failed.");
    } finally {
      setPending(false);
    }
  }

  async function prepareSignStep() {
    if (!session || !isValidXrplAddress(xrplAddress)) return;
    setPending(true);
    setStatus(null);
    try {
      await requestChallenge(session, xrplAddress);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not start XRPL link.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (step === "sign" && session && isValidXrplAddress(xrplAddress) && !nonce) {
      void prepareSignStep();
    }
  }, [step, session, xrplAddress, nonce, prepareSignStep]);

  async function submitLink(proof: {
    txBlob?: string;
    xrplSignature?: string;
    publicKey?: string;
  }) {
    if (!session || !nonce || !isValidXrplAddress(xrplAddress)) return;
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/credentials/xrpl/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          xrplAddress,
          nonce,
          address: session.address,
          message: session.message,
          signature: session.signature,
          txBlob: proof.txBlob,
          xrplSignature: proof.xrplSignature,
          publicKey: proof.publicKey,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; verified?: boolean; error?: string };
      if (!data.ok) {
        setStatus(data.error ?? "Link failed.");
        return;
      }
      setStep("done");
      setStatus(
        data.verified ? "XRPL wallet verified and linked." : "XRPL wallet linked (unverified).",
      );
      onLinked?.();
    } catch {
      setStatus("Link request failed.");
    } finally {
      setPending(false);
    }
  }

  async function submitManualProof() {
    await submitLink({
      xrplSignature: xrplSignature.trim() || undefined,
      publicKey: publicKey.trim() || undefined,
      txBlob: txBlob.trim() || undefined,
    });
  }

  return (
    <section
      id="xrpl-link"
      className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
    >
      <div>
        <h3 className="font-heading text-sm font-semibold text-white">Link XRPL wallet</h3>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Optional trust rail under your Culture ID on Base. Step 1: prove EVM ownership. Step 2:
          connect Crossmark or enter an address. Step 3: sign the link proof.
        </p>
      </div>

      {step === "evm" ? (
        <div className="space-y-3">
          {!address ? (
            <p className="text-xs text-amber-200/90">
              Connect your EVM wallet (Culture ID owner) first.
            </p>
          ) : (
            <p className="font-mono text-xs text-zinc-400">
              EVM: {address.slice(0, 6)}…{address.slice(-4)}
            </p>
          )}
          <button
            type="button"
            disabled={pending || signing || !address}
            onClick={() => void proveEvmAndContinue()}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5 disabled:opacity-50"
          >
            {signing ? "Signing…" : session ? "Continue" : "Prove Culture ID ownership"}
          </button>
        </div>
      ) : null}

      {step === "connect" ? (
        <div className="space-y-3">
          {hasCrossmark ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => void connectCrossmark()}
              className="w-full rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              Connect Crossmark
            </button>
          ) : (
            <p className="text-xs text-zinc-500">
              Install{" "}
              <a
                href="https://chromewebstore.google.com/detail/crossmark-wallet/canipghmckojpianfgiklhbgpfmhjkjg"
                target="_blank"
                rel="noreferrer noopener"
                className="text-emerald-300 hover:underline"
              >
                Crossmark
              </a>{" "}
              for one-click connect, or enter your XRPL address below.
            </p>
          )}
          <input
            value={xrplAddress}
            onChange={(e) => setXrplAddress(e.target.value.trim())}
            placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-zinc-200"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => void continueWithManualAddress()}
            className="rounded-full border border-[#C5FF41]/40 bg-[#C5FF41]/10 px-4 py-2 text-sm font-semibold text-[#C5FF41] hover:bg-[#C5FF41]/20 disabled:opacity-50"
          >
            Continue with address
          </button>
        </div>
      ) : null}

      {step === "sign" ? (
        <div className="space-y-3">
          <p className="font-mono text-xs text-zinc-400">
            XRPL: {xrplAddress.slice(0, 8)}…{xrplAddress.slice(-4)}
          </p>
          {message ? (
            <pre className="overflow-x-auto rounded-lg bg-black/50 p-3 text-[10px] text-zinc-500">
              {message}
            </pre>
          ) : pending ? (
            <p className="text-xs text-zinc-500">Preparing challenge…</p>
          ) : null}

          {!manualMode && hasCrossmark ? (
            <button
              type="button"
              disabled={pending || !nonce}
              onClick={() => void signWithCrossmark()}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              Sign with Crossmark
            </button>
          ) : null}

          <details className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-zinc-500">
            <summary className="cursor-pointer text-zinc-400">Manual sign / paste proof</summary>
            <div className="mt-3 space-y-2">
              <p>
                Sign the message above in any XRPL wallet, or sign a 1-drop self-payment with memo{" "}
                <code className="text-zinc-400">bc/xrpl-link</code> containing the nonce. Paste
                public key + signature hex, or a signed tx blob.
              </p>
              <input
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value.trim())}
                placeholder="Public key (hex)"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-[11px]"
              />
              <input
                value={xrplSignature}
                onChange={(e) => setXrplSignature(e.target.value.trim())}
                placeholder="Signature (hex)"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-[11px]"
              />
              <textarea
                value={txBlob}
                onChange={(e) => setTxBlob(e.target.value.trim())}
                placeholder="Signed tx blob (optional alternative)"
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-[11px]"
              />
              <button
                type="button"
                disabled={pending || !nonce}
                onClick={() => void submitManualProof()}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5 disabled:opacity-50"
              >
                Submit manual proof
              </button>
            </div>
          </details>
        </div>
      ) : null}

      {step === "done" ? (
        <p className="text-sm text-emerald-200/90">
          Linked. Refresh credentials to see your XRPL wallet.
        </p>
      ) : null}

      {status ? <p className="text-xs text-zinc-400">{status}</p> : null}
    </section>
  );
}
