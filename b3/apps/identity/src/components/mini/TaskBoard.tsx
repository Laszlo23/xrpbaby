"use client";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { sdk } from "@farcaster/miniapp-sdk";
import { toast } from "sonner";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMiniApp } from "@/providers/MiniAppProvider";
import { TASK_CATALOG, type TaskId } from "@/lib/mini/tasks";
import { miniAppUrl, QUEST_HASHTAG } from "@/lib/mini/site";
import { cn } from "@/lib/utils";

type TaskState = {
  completed: string[];
  xp: number;
  level: number;
};

export function TaskBoard() {
  const { quickAuthFetch, user } = useMiniApp();
  const navigate = useNavigate();
  const [state, setState] = useState<TaskState | null>(null);
  const [verifying, setVerifying] = useState<TaskId | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    try {
      const res = await quickAuthFetch("/api/mini/me");
      if (!res.ok) throw new Error("Failed to load progress");
      const data = (await res.json()) as TaskState & { tasks: TaskId[] };
      setState({
        completed: data.completed ?? [],
        xp: data.xp ?? 0,
        level: data.level ?? 1,
      });
    } catch {
      setState({ completed: [], xp: 0, level: 1 });
    } finally {
      setLoading(false);
    }
  }, [quickAuthFetch]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  async function verifyTask(taskId: TaskId) {
    setVerifying(taskId);
    try {
      const res = await quickAuthFetch(`/api/mini/tasks/${taskId}/verify`, {
        method: "POST",
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
        xp?: number;
        xpAwarded?: number;
      };

      if (!res.ok || !body.ok) {
        toast.error(body.error ?? "Could not verify task");
        return;
      }

      toast.success(`+${body.xpAwarded ?? 0} XP earned!`);
      await loadProgress();
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(null);
    }
  }

  async function runTaskAction(taskId: TaskId) {
    const task = TASK_CATALOG.find((t) => t.id === taskId);
    if (!task?.requiresAction) return;

    switch (task.requiresAction) {
      case "compose": {
        const text =
          taskId === "cast_hashtag"
            ? `Minting my onchain identity on Culture Layer #${QUEST_HASHTAG} ${miniAppUrl("/")}`
            : `Check out Culture Layer — own your .culture identity ${miniAppUrl("/")}`;
        try {
          await sdk.actions.composeCast({ text });
        } catch {
          toast.message("Open Warpcast to compose your cast");
        }
        break;
      }
      case "open_mint":
        void navigate({ to: "/mint" });
        break;
      case "open_profile":
        void navigate({ to: "/profile" });
        break;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completedSet = new Set(state?.completed ?? []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quest board</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete social quests to earn XP
          {user?.username ? ` · @${user.username}` : ""}
        </p>
      </div>

      <ul className="space-y-3">
        {TASK_CATALOG.map((task) => {
          const done = completedSet.has(task.id);
          const busy = verifying === task.id;

          return (
            <li
              key={task.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                done
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/60 bg-card/40",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium">{task.title}</h2>
                    {done && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1 font-mono text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    +{task.xp} XP
                  </p>
                </div>
              </div>

              {!done && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {task.ctaLabel && task.requiresAction && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void runTaskAction(task.id)}
                    >
                      {task.ctaLabel}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy}
                    onClick={() => void verifyTask(task.id)}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Verifying
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
