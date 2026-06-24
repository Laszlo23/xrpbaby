import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MessageCircle,
  Share2,
  Sprout,
  Store,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatForestTaskPoints, type ForestDashboardTask } from "@/lib/forest-dashboard-tasks";

const ICONS: Record<string, LucideIcon> = {
  "connect-wallet": Wallet,
  "join-forest": UserPlus,
  "visit-marketplace": Store,
  "visit-liquidity-hub": Sprout,
  "bcc-roots-stake": Sprout,
  "studio-first-app": ExternalLink,
  "daily-studio-build": ExternalLink,
  "daily-share-post": Share2,
  "follow-farcaster": MessageCircle,
  "x-reply-official": Share2,
  "telegram-join-buildingculture": MessageCircle,
};

type Props = {
  task: ForestDashboardTask;
  done: boolean;
  claiming: boolean;
  claimDisabled: boolean;
  onClaimInline?: (slug: string) => void;
};

export function ForestTaskCard({ task, done, claiming, claimDisabled, onClaimInline }: Props) {
  const Icon = ICONS[task.slug] ?? Sprout;
  const pointsLabel = formatForestTaskPoints(task.culturePoints);
  const muted = done || task.kind === "coming_soon";

  return (
    <article
      className={`flex flex-col rounded-2xl border p-4 transition-colors ${
        done
          ? "border-[#C5FF41]/25 bg-[#C5FF41]/5"
          : task.kind === "coming_soon"
            ? "border-zinc-800 bg-zinc-950/40 opacity-70"
            : "border-white/10 bg-zinc-950/60 hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
          <Icon className="h-4 w-4 text-[#C5FF41]" />
        </div>
        <span className="mono-label !text-[10px] !text-[#C5FF41]">{pointsLabel}</span>
      </div>
      <h3 className="mt-3 font-display text-sm font-semibold text-white">{task.title}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500">{task.description}</p>
      <div className="mt-4">
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C5FF41]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        ) : task.kind === "coming_soon" ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            Coming soon
          </span>
        ) : task.kind === "inline" ? (
          <Button
            type="button"
            size="sm"
            disabled={claimDisabled || muted}
            className="w-full rounded-full bg-[#C5FF41] text-xs font-semibold text-black hover:bg-white"
            onClick={() => onClaimInline?.(task.slug)}
          >
            {claiming ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Claiming…
              </>
            ) : (
              "Claim"
            )}
          </Button>
        ) : task.kind === "profile" ? (
          <Link
            to="/profile"
            hash="social-tasks"
            className="block w-full rounded-full border border-white/15 py-2 text-center text-xs font-semibold text-white hover:border-[#C5FF41]/40"
          >
            Open in profile
          </Link>
        ) : task.claimRoute ? (
          (() => {
            const [path, hash] = task.claimRoute.split("#");
            return (
              <Link
                to={path}
                {...(hash ? { hash } : {})}
                className="block min-h-11 w-full rounded-full bg-[#C5FF41] py-3 text-center text-sm font-semibold text-black hover:bg-white"
              >
                Go
              </Link>
            );
          })()
        ) : null}
      </div>
    </article>
  );
}
