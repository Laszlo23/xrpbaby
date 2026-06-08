import { useEffect, useRef, useState } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import { tgCompleteTask, tgTonConnected } from "@/lib/tg/api";

function tonWalletAppName(wallet: ReturnType<typeof useTonWallet>): string {
  const name = wallet?.device?.appName?.trim();
  return name || "tonconnect";
}

function shortTonAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function TgTonBonusCard({
  tonConnected,
  tonWalletAddress,
  initDataRaw,
  onRefresh,
  onXp,
  visible,
}: {
  tonConnected: boolean;
  tonWalletAddress: string | null;
  initDataRaw: string | null;
  onRefresh: () => void;
  onXp: (msg: string) => void;
  visible: boolean;
}) {
  const wallet = useTonWallet();
  const [syncing, setSyncing] = useState(false);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    const address = wallet?.account?.address;
    if (!address || syncing || syncedRef.current === address) return;
    if (tonConnected && tonWalletAddress === address) return;
    void (async () => {
      setSyncing(true);
      const res = await tgTonConnected(address, tonWalletAppName(wallet), initDataRaw);
      if (!res.ok) {
        setSyncing(false);
        return;
      }
      syncedRef.current = address;
      const bonus = await tgCompleteTask("ton_bonus", undefined, initDataRaw);
      if (bonus.ok && bonus.data.xpGranted > 0) {
        onXp(`+${bonus.data.xpGranted} XP — wallet bonus!`);
      }
      setSyncing(false);
      onRefresh();
    })();
  }, [
    wallet?.account?.address,
    tonConnected,
    tonWalletAddress,
    syncing,
    initDataRaw,
    onRefresh,
    onXp,
    wallet,
  ]);

  if (!visible) return null;

  const displayAddress = wallet?.account?.address ?? tonWalletAddress;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Bonus</p>
      <h3 className="text-sm font-semibold text-white">Wallet bonus +50 XP</h3>
      <p className="text-xs text-zinc-400">Optional — unlock a badge when you&apos;re ready.</p>
      {tonConnected && displayAddress ? (
        <div className="rounded-xl border border-[#C5FF41]/30 bg-[#C5FF41]/5 px-3 py-2">
          <p className="text-xs text-[#C5FF41]">TON connected</p>
          <p className="font-mono text-xs text-zinc-400">{shortTonAddress(displayAddress)}</p>
        </div>
      ) : (
        <TonConnectButton className="!rounded-xl !w-full" />
      )}
      {syncing ? <p className="text-xs text-zinc-500">Linking wallet…</p> : null}
    </section>
  );
}
