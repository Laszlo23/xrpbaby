import { useCallback, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { toast } from "sonner";

function extractWalletAuthPayload(result: unknown): {
  address: string;
  message: string;
  signature: string;
} | null {
  if (!result || typeof result !== "object") return null;
  const r = result as Record<string, unknown>;
  const inner = r.data;
  const cand =
    typeof inner === "object" && inner !== null && "address" in inner
      ? (inner as Record<string, unknown>)
      : r;
  const addr = cand.address;
  const msg = cand.message;
  const sig = cand.signature;
  if (
    typeof addr === "string" &&
    typeof msg === "string" &&
    typeof sig === "string" &&
    addr.startsWith("0x")
  ) {
    return { address: addr, message: msg, signature: sig };
  }
  return null;
}

/** Optional SIWE verification against our server (session wiring can be added later). */
export function WorldWalletSiweButton() {
  const { isInstalled } = useMiniKit();
  const [busy, setBusy] = useState(false);

  const onVerify = useCallback(async () => {
    setBusy(true);
    try {
      const nonceRes = await fetch("/api/world/wallet-nonce", { credentials: "same-origin" });
      if (!nonceRes.ok) throw new Error("nonce_failed");
      const { nonce } = (await nonceRes.json()) as { nonce?: string };
      if (!nonce || typeof nonce !== "string") throw new Error("nonce_missing");

      const authResult = await MiniKit.walletAuth({ nonce });
      const walletAuth = extractWalletAuthPayload(authResult);
      if (!walletAuth) throw new Error("wallet_auth_payload");

      const verifyRes = await fetch("/api/world/wallet-verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce, walletAuth }),
      });
      const data = (await verifyRes.json()) as { ok?: boolean; address?: string; error?: string };
      if (!verifyRes.ok || !data.ok) {
        toast.error(data.error ?? "Verification failed");
        return;
      }
      toast.success(`Verified ${data.address?.slice(0, 8)}…`);
    } catch {
      toast.error("World wallet verification failed");
    } finally {
      setBusy(false);
    }
  }, []);

  if (isInstalled !== true) return null;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onVerify()}
      className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:opacity-50 sm:text-[11px]"
    >
      {busy ? "Verifying…" : "Verify World session"}
    </button>
  );
}
