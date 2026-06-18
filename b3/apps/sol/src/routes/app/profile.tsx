"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { enrollPath } from "@/lib/api/builder.functions";
import { getBccBalanceFn } from "@/lib/api/rewards.functions";
import { useBuilder } from "@/hooks/use-builder";
import { PATHS } from "@/lib/paths-data";

const profileSearchSchema = z.object({
  path: z.string().optional(),
});

export const Route = createFileRoute("/app/profile")({
  validateSearch: profileSearchSchema,
  component: ProfilePage,
});

function ProfilePage() {
  const { path: pathFromQuery } = Route.useSearch();
  const { builder, walletAddress, refetch } = useBuilder();

  const balanceQuery = useQuery({
    queryKey: ["bcc-balance", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return { balance: 0 };
      return getBccBalanceFn({ data: { walletAddress } });
    },
    enabled: !!walletAddress,
  });

  const enrollMutation = useMutation({
    mutationFn: async (pathSlug: string) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      return enrollPath({ data: { walletAddress, pathSlug } });
    },
    onSuccess: (data) => {
      toast.success(`Enrolled in ${data.pathTitle}`);
      refetch();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!builder || !walletAddress) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Builder profile</p>
      <h1 className="mt-4 font-display text-5xl font-bold">Your identity</h1>

      <div className="mt-12 grid gap-px border border-border bg-border lg:grid-cols-2">
        <div className="bg-background p-8">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Wallet
          </h2>
          <p className="mt-4 break-all font-mono text-sm">{walletAddress}</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                BCC Balance
              </p>
              <p className="mt-2 font-display text-3xl font-bold">
                {balanceQuery.data?.balance ?? 0}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Builder Score
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{builder.builderScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-background p-8">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Enrolled path
          </h2>
          <p className="mt-4 font-display text-2xl font-bold">
            {builder.enrolledPathTitle ?? "None yet"}
          </p>
          {pathFromQuery && pathFromQuery !== builder.enrolledPathSlug && (
            <button
              type="button"
              disabled={enrollMutation.isPending}
              onClick={() => enrollMutation.mutate(pathFromQuery)}
              className="mt-6 bg-signal px-5 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground"
            >
              Enroll in {PATHS.find((p) => p.slug === pathFromQuery)?.title ?? pathFromQuery}
            </button>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl font-bold">Choose a path</h2>
        <p className="mt-3 text-muted-foreground">
          Enrolling unlocks path-specific missions and capstone rewards.
        </p>
        <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((p) => {
            const enrolled = builder.enrolledPathSlug === p.slug;
            const Icon = p.icon;
            return (
              <div key={p.slug} className="flex flex-col justify-between bg-background p-6">
                <div>
                  <Icon className="h-6 w-6 text-signal" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                </div>
                <button
                  type="button"
                  disabled={enrolled || enrollMutation.isPending}
                  onClick={() => enrollMutation.mutate(p.slug)}
                  className="mt-6 w-full border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-surface disabled:border-signal/40 disabled:text-signal"
                >
                  {enrolled ? "Enrolled" : "Enroll"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <Link
        to="/"
        className="mt-12 inline-block font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-signal"
      >
        ← Marketing site
      </Link>
    </div>
  );
}
