/** Loading placeholder matching PropertyCard layout to avoid layout shift. */
export function PropertyCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-elevated/50"
      aria-hidden
    >
      <div className="aspect-[16/10] w-full animate-pulse bg-zinc-800/80" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <div className="h-2 w-24 animate-pulse rounded bg-zinc-700/80" />
          <div className="h-2 w-full max-w-[200px] animate-pulse rounded bg-zinc-800/80" />
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/[0.04] p-4">
          <div className="h-10 animate-pulse rounded-lg bg-zinc-800/60" />
          <div className="h-10 animate-pulse rounded-lg bg-zinc-800/60" />
          <div className="h-10 animate-pulse rounded-lg bg-zinc-800/60" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 flex-1 animate-pulse rounded-full bg-zinc-800/70" />
          <div className="h-10 flex-1 animate-pulse rounded-full bg-zinc-800/70" />
        </div>
      </div>
    </div>
  );
}
