import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { LandingNav } from "@/components/landing/LandingNav";
import { useStudioAuthPayload } from "@/hooks/useStudioAuth";
import { formatStudioError } from "@/lib/studio-errors";
import { postStudioCreateProject, postStudioListProjects } from "@/lib/studio-fns";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/studio/")({
  component: StudioIndexPage,
  head: () =>
    pageHead({
      title: "BC Studio",
      description:
        "Build and ship web apps with AI — community-gated creation tool by Building Culture.",
      path: "/studio",
      keywords: ["BC Studio", "app builder", "AI", "Building Culture"],
    }),
});

function StudioIndexPage() {
  const { address, authenticated, authPayload } = useStudioAuthPayload();
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const listProjects = useServerFn(postStudioListProjects);
  const createProject = useServerFn(postStudioCreateProject);

  const canUseStudio = authenticated && Boolean(address);

  const listQuery = useQuery({
    queryKey: ["studio-projects", address],
    enabled: canUseStudio,
    queryFn: async () => {
      const payload = await authPayload();
      return listProjects({ data: payload });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (displayName: string) => {
      setCreateError(null);
      const payload = await authPayload();
      return createProject({ data: { ...payload, displayName } });
    },
    onSuccess: (res) => {
      if (res.ok && res.project) {
        toast.success("App created");
        void queryClient.invalidateQueries({ queryKey: ["studio-projects", address] });
        window.location.assign(`/studio/${res.project.id}`);
        return;
      }
      const msg = formatStudioError(res.ok ? undefined : res.error);
      setCreateError(msg);
      toast.error(msg);
    },
    onError: (err) => {
      const msg = formatStudioError(err instanceof Error ? err.message : "create_failed");
      setCreateError(msg);
      toast.error(msg);
    },
  });

  const projects = listQuery.data?.ok ? listQuery.data.projects : [];
  const quota = listQuery.data?.ok ? listQuery.data.quota : null;

  return (
    <div className="bc-surface min-h-screen">
      <LandingNav compact />
      <main className="mx-auto max-w-5xl px-5 pt-28 pb-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mono-label">BC STUDIO</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
              Build culture. <span className="bc-text-cyan-gradient">Ship apps.</span>
            </h1>
            <p className="mt-3 max-w-xl text-zinc-400">
              Lovable-style creation for the community — chat to build, preview in a sandbox, export
              or publish to Building Culture.
            </p>
          </div>
          {quota && (
            <p className="text-sm text-zinc-500">
              Generations today: {quota.usedToday}/{quota.freePerDay} free
            </p>
          )}
        </div>

        {!canUseStudio && (
          <div className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <p className="text-amber-100">Sign in and connect your wallet to use BC Studio.</p>
            <Link to="/join" className="mt-3 inline-block text-sm font-medium text-[#00E5FF]">
              Create your pass →
            </Link>
          </div>
        )}

        {canUseStudio && (
          <form
            className="mt-10 flex flex-wrap gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const n = name.trim() || "My app";
              createMutation.mutate(n);
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="App name"
              className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
              disabled={createMutation.isPending}
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00E5FF] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {createMutation.isPending ? "Creating…" : "New app"}
            </button>
          </form>
        )}

        {createError && (
          <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {createError}
          </p>
        )}

        {listQuery.data && !listQuery.data.ok && (
          <p className="mt-6 text-sm text-rose-300">
            {formatStudioError(listQuery.data.error)}
          </p>
        )}

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                to="/studio/$projectId"
                params={{ projectId: p.id }}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#00E5FF]/30"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#00E5FF]" />
                  <span className="font-semibold text-white">{p.displayName}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-zinc-500">{p.slug}</p>
                <p className="mt-2 text-xs capitalize text-zinc-400">{p.status}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
