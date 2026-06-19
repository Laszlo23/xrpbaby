import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export type AsyncSectionState = "loading" | "ready" | "empty" | "error" | "degraded";

type AsyncSectionProps = {
  state: AsyncSectionState;
  children: ReactNode;
  skeleton?: ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  degradedMessage?: string;
  onRetry?: () => void;
  className?: string;
};

function DefaultSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-2/3 bg-white/10" />
      <Skeleton className="h-4 w-full bg-white/10" />
      <Skeleton className="h-24 w-full rounded-2xl bg-white/10" />
    </div>
  );
}

export function AsyncSection({
  state,
  children,
  skeleton,
  emptyMessage = "Nothing here yet.",
  errorMessage = "Could not load this section.",
  degradedMessage = "Showing limited data — some services are unavailable.",
  onRetry,
  className = "",
}: AsyncSectionProps) {
  if (state === "loading") {
    return <div className={className}>{skeleton ?? <DefaultSkeleton />}</div>;
  }

  if (state === "error") {
    return (
      <div
        className={`rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-5 text-center ${className}`}
      >
        <p className="text-sm text-rose-100/90">{errorMessage}</p>
        {onRetry ? (
          <button
            type="button"
            className="mt-3 rounded-full border border-white/15 px-4 py-2 text-xs text-zinc-200 hover:text-white"
            onClick={onRetry}
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  if (state === "degraded") {
    return (
      <div className={className}>
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          {degradedMessage}
          {onRetry ? (
            <button
              type="button"
              className="ml-2 underline underline-offset-2 hover:text-white"
              onClick={onRetry}
            >
              Retry
            </button>
          ) : null}
        </p>
        {children}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-500 ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

export function AsyncSectionSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500" aria-busy="true">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}
