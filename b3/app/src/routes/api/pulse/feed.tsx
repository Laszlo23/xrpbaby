import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/pulse/feed")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }
        const url = new URL(request.url);
        const platform = url.searchParams.get("platform") ?? undefined;
        const cursor = url.searchParams.get("cursor") ?? undefined;
        const limit = Math.min(
          Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20,
          50,
        );

        const items = await prisma.socialFeedItem.findMany({
          where: platform ? { platform } : undefined,
          orderBy: { publishedAt: "desc" },
          take: limit + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });

        const hasMore = items.length > limit;
        const page = hasMore ? items.slice(0, limit) : items;
        const nextCursor = hasMore ? page[page.length - 1]?.id : null;

        return json({
          ok: true,
          items: page.map((i) => ({
            id: i.id,
            platform: i.platform,
            authorHandle: i.authorHandle,
            authorName: i.authorName,
            content: i.content,
            mediaUrls: i.mediaUrls,
            permalink: i.permalink,
            metrics: i.metrics,
            publishedAt: i.publishedAt,
            featured: i.featured,
          })),
          nextCursor,
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
