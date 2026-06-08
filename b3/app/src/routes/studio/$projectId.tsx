import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Play, Rocket } from "lucide-react";

import { LandingNav } from "@/components/landing/LandingNav";
import { ChatPanel } from "@/components/studio/ChatPanel";
import { FileTree } from "@/components/studio/FileTree";
import { PreviewFrame } from "@/components/studio/PreviewFrame";
import { useStudioAuthPayload } from "@/hooks/useStudioAuth";
import {
  postStudioExport,
  postStudioGenerate,
  postStudioGetProject,
  postStudioPublish,
  postStudioStartSandbox,
} from "@/lib/studio-fns";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/studio/$projectId")({
  component: StudioWorkspacePage,
  head: () =>
    pageHead({
      title: "BC Studio — Workspace",
      description: "Edit and preview your BC Studio app.",
      path: "/studio",
    }),
});

function StudioWorkspacePage() {
  const { projectId } = Route.useParams();
  const { authPayload } = useStudioAuthPayload();
  const queryClient = useQueryClient();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: ["studio-project", projectId],
    queryFn: async () => {
      const payload = await authPayload();
      return postStudioGetProject({ data: { ...payload, projectId } });
    },
  });

  const project = projectQuery.data?.ok ? projectQuery.data.project : null;

  const sandboxMutation = useMutation({
    mutationFn: async () => {
      const payload = await authPayload();
      return postStudioStartSandbox({ data: { ...payload, projectId } });
    },
    onSuccess: (res) => {
      if (!res.ok) setPreviewError(res.error);
      else {
        setPreviewError(null);
        queryClient.invalidateQueries({ queryKey: ["studio-project", projectId] });
      }
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (message: string) => {
      const payload = await authPayload();
      return postStudioGenerate({ data: { ...payload, projectId, message } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-project", projectId] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const payload = await authPayload();
      return postStudioExport({ data: { ...payload, projectId } });
    },
    onSuccess: (res) => {
      if (!res.ok || !res.bundle) return;
      const blob = new Blob([JSON.stringify(res.bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${res.bundle.slug}-bundle.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const payload = await authPayload();
      return postStudioPublish({ data: { ...payload, projectId } });
    },
  });

  if (projectQuery.isLoading) {
    return <div className="bc-surface min-h-screen pt-28 text-center text-zinc-400">Loading…</div>;
  }

  if (!project) {
    return (
      <div className="bc-surface min-h-screen pt-28 text-center">
        <p className="text-zinc-400">Project not found or access denied.</p>
        <Link to="/studio" className="mt-4 inline-block text-[#00E5FF]">
          ← Back to studio
        </Link>
      </div>
    );
  }

  return (
    <div className="bc-surface flex h-screen flex-col">
      <LandingNav compact />
      <header className="mt-16 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <div>
          <Link to="/studio" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← Studio
          </Link>
          <h1 className="text-lg font-semibold text-white">{project.displayName}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => sandboxMutation.mutate()}
            disabled={sandboxMutation.isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5"
          >
            <Play size={14} /> Preview
          </button>
          <button
            type="button"
            onClick={() => exportMutation.mutate()}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5"
          >
            <Download size={14} /> Export
          </button>
          <button
            type="button"
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            className="inline-flex items-center gap-1 rounded-lg bg-[#C5FF41] px-3 py-1.5 text-xs font-semibold text-black"
          >
            <Rocket size={14} /> Publish
          </button>
        </div>
      </header>

      {publishMutation.data?.ok && (
        <p className="bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-200">
          Published:{" "}
          <a href={publishMutation.data.publishedUrl} className="underline">
            {publishMutation.data.publishedUrl}
          </a>
        </p>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <ChatPanel
            messages={project.messages}
            busy={generateMutation.isPending}
            onSend={(text) => generateMutation.mutate(text)}
          />
        </div>
        <div className="lg:col-span-2">
          <FileTree files={project.files} selectedPath={selectedPath} onSelect={setSelectedPath} />
        </div>
        <div className="lg:col-span-7">
          <PreviewFrame previewUrl={project.previewUrl} error={previewError} />
        </div>
      </div>
    </div>
  );
}
