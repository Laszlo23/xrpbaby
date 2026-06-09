import { useEffect, useState } from "react";
import type { TgTask, TgTasksResponse } from "@/lib/tg/api";
import { tgCompleteTask } from "@/lib/tg/api";
import { readTelegramStartParam } from "@/lib/tg/telegram-webapp";

export function TgPlayTab({
  tasksData,
  initDataRaw,
  initialTaskId,
  onClearInitialTask,
  onRefresh,
  onXp,
  onSwitchHome,
}: {
  tasksData: TgTasksResponse;
  initDataRaw: string | null;
  initialTaskId?: string | null;
  onClearInitialTask?: () => void;
  onRefresh: () => void;
  onXp: (msg: string) => void;
  onSwitchHome: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<TgTask | null>(null);

  useEffect(() => {
    if (!initialTaskId) return;
    const t = tasksData.tasks.find((x) => x.id === initialTaskId && x.status === "available");
    if (t) setActiveTask(t);
    onClearInitialTask?.();
  }, [initialTaskId, tasksData.tasks, onClearInitialTask]);

  const playable = tasksData.tasks.filter((t) => t.id !== "ton_bonus" && t.status === "available");

  async function complete(
    taskId: string,
    payload?: { moodId?: string; quizAnswerId?: string; thanksPreset?: string },
  ) {
    setBusy(taskId);
    setQuizError(null);
    const res = await tgCompleteTask(taskId, payload, initDataRaw);
    setBusy(null);
    if (!res.ok) {
      if (res.error === "quiz_incorrect") setQuizError("Not quite — try again!");
      else if (res.error === "task_locked") onSwitchHome();
      return;
    }
    if (res.data.xpGranted > 0) onXp(`+${res.data.xpGranted} XP`);
    setActiveTask(null);
    await onRefresh();
  }

  function handleShare() {
    const ref = readTelegramStartParam() || "community";
    const url = `https://t.me/buildingcultureappbot?start=ref_${ref}`;
    const text = "Join me in Building Culture — play daily & climb the board 🌿";
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      );
    }
    void complete("share_invite");
  }

  if (activeTask) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setActiveTask(null)} className="text-xs text-zinc-500">
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-white">{activeTask.title}</h2>
        <p className="text-sm text-zinc-400">{activeTask.subtitle}</p>

        {activeTask.kind === "emoji" ? (
          <div className="grid grid-cols-3 gap-2">
            {tasksData.moodOptions.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={busy === activeTask.id}
                onClick={() => void complete(activeTask.id, { moodId: m.id })}
                className="rounded-xl border border-zinc-700 bg-zinc-900/60 py-4 text-center"
              >
                <span className="text-2xl">{m.emoji}</span>
                <p className="mt-1 text-[10px] text-zinc-400">{m.label}</p>
              </button>
            ))}
          </div>
        ) : null}

        {activeTask.kind === "quiz" ? (
          <div className="space-y-2">
            <p className="text-sm text-white">{tasksData.quiz.question}</p>
            {quizError ? <p className="text-xs text-red-400">{quizError}</p> : null}
            {tasksData.quiz.options.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={busy === activeTask.id}
                onClick={() => void complete(activeTask.id, { quizAnswerId: o.id })}
                className="block w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-left text-sm text-zinc-200"
              >
                {o.label}
              </button>
            ))}
          </div>
        ) : null}

        {activeTask.kind === "thanks" ? (
          <div className="space-y-2">
            {tasksData.thanksPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={busy === activeTask.id}
                onClick={() => void complete(activeTask.id, { thanksPreset: preset })}
                className="block w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-left text-sm text-zinc-200"
              >
                {preset}
              </button>
            ))}
          </div>
        ) : null}

        {activeTask.kind === "share" ? (
          <button
            type="button"
            disabled={busy === activeTask.id}
            onClick={() => handleShare()}
            className="w-full rounded-xl bg-[#C5FF41] py-3 text-sm font-bold text-black"
          >
            Share invite link
          </button>
        ) : null}

        {activeTask.kind === "tap" ? (
          <button
            type="button"
            disabled={busy === activeTask.id}
            onClick={() => void complete(activeTask.id)}
            className="w-full rounded-xl bg-[#C5FF41] py-3 text-sm font-bold text-black"
          >
            {activeTask.id === "wave_hello" ? "👋 Wave!" : "Check in"}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">Tap a mission — keep it fun, keep it simple.</p>
      {playable.length === 0 ? (
        <p className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">
          All caught up! Check Home for what&apos;s next.
        </p>
      ) : (
        playable.slice(0, 4).map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => setActiveTask(task)}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-medium text-white">{task.title}</p>
              <p className="text-xs text-zinc-500">+{task.xpReward} XP</p>
            </div>
            <span className="text-[#C5FF41]">→</span>
          </button>
        ))
      )}
    </div>
  );
}
