import { Sprout } from "lucide-react";
import type { TgHomeResponse } from "@/lib/tg/api";
import { TgMissionCard } from "@/components/tg/TgMissionCard";
import { TgStreakBadge } from "@/components/tg/TgStreakBadge";
import { TgTonBonusCard } from "@/components/tg/TgTonBonusCard";

const COMMUNITY_URL =
  import.meta.env.VITE_COMMUNITY_TELEGRAM_URL || "https://t.me/+4zFH7-2tyW0yOTBk";

export function TgHomeTab({
  home,
  initDataRaw,
  busy,
  onMissionAction,
  onRefresh,
  onXp,
  agentRef,
}: {
  home: TgHomeResponse;
  initDataRaw: string | null;
  busy: boolean;
  onMissionAction: () => void;
  onRefresh: () => void;
  onXp: (msg: string) => void;
  agentRef: string;
}) {
  const g = home.gamification;
  const pct = Math.min(100, Math.round(((g.xp % 100) / 100) * 100) || (g.xp > 0 ? 100 : 0));
  const showTonBonus = g.coreMissionsCompleted >= 3;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#C5FF41]/20 bg-[#0c0d12] p-4">
        <p className="text-xs text-zinc-500">
          Hey <span className="text-white">{home.member.displayName}</span> — you&apos;re building
          block #{home.member.blockNumber}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-[#C5FF41]" />
            <div>
              <p className="text-sm font-semibold text-white">
                Level {g.level} · {g.forestStage}
              </p>
              <p className="text-xs text-zinc-500">{g.xp} XP</p>
            </div>
          </div>
          <TgStreakBadge days={g.streakDays} />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full bg-[#C5FF41] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {home.currentMission ? (
        <TgMissionCard task={home.currentMission} busy={busy} onAction={onMissionAction} />
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
          <p className="text-sm text-zinc-300">You crushed today&apos;s missions.</p>
          <p className="mt-1 text-xs text-zinc-500">Come back tomorrow for your tap-in.</p>
        </div>
      )}

      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(
          `https://t.me/buildingcultureappbot?start=ref_${agentRef}`,
        )}&text=${encodeURIComponent("Join me in Building Culture — play daily & climb the board 🌿")}`}
        className="block rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-center text-sm text-zinc-200"
      >
        Bring a friend <span className="text-[#C5FF41]">+30 XP</span>
      </a>

      <TgTonBonusCard
        tonConnected={home.wallets.tonConnected}
        tonWalletAddress={home.wallets.tonWalletAddress}
        initDataRaw={initDataRaw}
        onRefresh={onRefresh}
        onXp={onXp}
        visible={showTonBonus}
      />

      <div className="rounded-2xl border border-[#00E5FF]/25 bg-[#00E5FF]/5 p-4">
        <p className="text-sm font-medium text-white">Earn on web too</p>
        <p className="mt-1 text-xs text-zinc-400">
          Link your wallet on the main app for Culture Points, SIWE quests, and a unified
          leaderboard path with Telegram XP.
        </p>
        <a
          href={`https://app.buildingcultureid.space/join?agent_ref=${encodeURIComponent(agentRef)}&utm_source=telegram&utm_medium=miniapp&utm_campaign=web_bridge`}
          className="mt-3 block rounded-xl bg-[#C5FF41] px-4 py-2.5 text-center text-sm font-semibold text-black"
        >
          Connect wallet on web (+25 pts)
        </a>
        <a
          href={`https://app.buildingcultureid.space/profile?utm_source=telegram&utm_medium=miniapp`}
          className="mt-2 block text-center text-xs text-zinc-500 underline"
        >
          Open web profile & quests
        </a>
      </div>

      <footer className="space-y-2 pt-2 text-center">
        <a href={COMMUNITY_URL} className="text-xs text-zinc-500 underline">
          Join the community group
        </a>
        <a
          href={`https://app.buildingcultureid.space/join?agent_ref=${encodeURIComponent(agentRef)}&utm_source=telegram&utm_medium=miniapp`}
          className="block text-xs text-zinc-600"
        >
          Explore the full app →
        </a>
      </footer>
    </div>
  );
}
