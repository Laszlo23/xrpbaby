"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ListTodo, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { XpBar } from "./XpBar";
import { useMiniApp } from "@/providers/MiniAppProvider";
import { TASK_CATALOG } from "@/lib/mini/tasks";

type MeResponse = {
  xp: number;
  level: number;
  completed: string[];
};

export function MiniHome() {
  const { quickAuthFetch, user } = useMiniApp();
  const [me, setMe] = useState<MeResponse | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await quickAuthFetch("/api/mini/me");
      if (res.ok) setMe((await res.json()) as MeResponse);
    } catch {
      setMe({ xp: 0, level: 1, completed: [] });
    }
  }, [quickAuthFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalTasks = TASK_CATALOG.length;
  const done = me?.completed.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user?.displayName
            ? `Hey, ${user.displayName}`
            : "Culture Layer Quests"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mint your identity. Complete quests. Climb the ranks.
        </p>
      </div>

      <XpBar xp={me?.xp ?? 0} />

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Progress
        </p>
        <p className="mt-1 text-3xl font-semibold">
          {done}
          <span className="text-lg text-muted-foreground">/{totalTasks}</span>
        </p>
        <p className="text-sm text-muted-foreground">quests completed</p>
      </div>

      <div className="grid gap-3">
        <Button asChild className="h-12 justify-between">
          <Link to="/tasks">
            Continue quests
            <ListTodo className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 justify-between">
          <Link to="/mint">
            Mint identity
            <Coins className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" className="justify-between text-muted-foreground">
          <Link to="/leaderboard">
            Leaderboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
