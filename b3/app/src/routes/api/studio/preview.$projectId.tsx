import { createFileRoute } from "@tanstack/react-router";

import { studioSandboxHost, studioSandboxSecret } from "@/server/studio/config";

export const Route = createFileRoute("/api/studio/preview/$projectId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const projectId = params?.projectId;
        if (!projectId) return new Response("missing_project", { status: 400 });

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return new Response("no_database", { status: 503 });

        const project = await prisma.studioProject.findUnique({
          where: { id: projectId },
          select: { sandboxContainerId: true },
        });

        if (!project?.sandboxContainerId) {
          return new Response("preview_not_ready", { status: 404 });
        }

        const host = studioSandboxHost();
        if (!host) return new Response("sandbox_not_configured", { status: 503 });

        const base = host.replace(/\/$/, "");
        const secret = studioSandboxSecret();
        const headers: Record<string, string> = {};
        if (secret) headers.Authorization = `Bearer ${secret}`;

        const upstream = await fetch(
          `${base}/sandboxes/${encodeURIComponent(project.sandboxContainerId)}/proxy/`,
          { headers },
        ).catch(() => null);

        if (!upstream?.ok) {
          return new Response("preview_unreachable", { status: 502 });
        }

        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "text/html",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
  component: () => null,
});
