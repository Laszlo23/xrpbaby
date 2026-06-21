import { createFileRoute } from "@tanstack/react-router";

import { proxyBuilderTapeAudio } from "@/server/media/builder-tape-audio";

export const Route = createFileRoute("/api/media/builder-tapes/$file")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const file = params?.file;
        if (!file) {
          return new Response("Bad request", { status: 400 });
        }
        return proxyBuilderTapeAudio(file, request);
      },
      HEAD: async ({ params, request }) => {
        const file = params?.file;
        if (!file) {
          return new Response(null, { status: 400 });
        }
        const res = await proxyBuilderTapeAudio(file, request);
        return new Response(null, {
          status: res.status,
          headers: res.headers,
        });
      },
    },
  },
  component: () => null,
});
