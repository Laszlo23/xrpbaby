import type { TgTask } from "@/lib/tg/api";

export function TgMissionCard({
  task,
  busy,
  onAction,
}: {
  task: TgTask;
  busy: boolean;
  onAction: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#C5FF41]/25 bg-gradient-to-br from-[#141810] to-[#0c0d12] p-5">
      <p className="text-xs uppercase tracking-widest text-[#C5FF41]">Next up</p>
      <h2 className="mt-1 text-lg font-semibold text-white">{task.title}</h2>
      <p className="mt-1 text-sm text-zinc-400">{task.subtitle}</p>
      <p className="mt-3 text-xs text-zinc-500">+{task.xpReward} XP</p>
      {task.status === "available" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onAction}
          className="mt-4 w-full rounded-xl bg-[#C5FF41] py-3 text-sm font-bold text-black disabled:opacity-50"
        >
          {busy ? "…" : task.kind === "tap" ? "Let's go" : "Start"}
        </button>
      ) : (
        <p className="mt-4 text-sm text-[#C5FF41]">Done for now</p>
      )}
    </div>
  );
}
