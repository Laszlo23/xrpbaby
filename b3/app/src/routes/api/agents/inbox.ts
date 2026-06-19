import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { getPrisma } from "@/server/db/prisma";
import { recordCultureMemoryEvent } from "@/server/memory/timeline";

const postSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  subject: z.string().min(1).max(200),
  agentKind: z.enum(["research", "grant", "grove", "trading", "replay"]),
  body: z.string().min(1).max(8000),
});

export const Route = createFileRoute("/api/agents/inbox")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const address = url.searchParams.get("address");
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
          return json({ ok: false, error: "invalid_address" }, 400);
        }

        const prisma = getPrisma();
        if (!prisma) return json({ ok: true, threads: [] });

        const threads = await prisma.agentInboxThread.findMany({
          where: { walletAddress: address.toLowerCase() },
          orderBy: { updatedAt: "desc" },
          take: 30,
          include: {
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        });

        return json({
          ok: true,
          threads: threads.map((t) => ({
            id: t.id,
            subject: t.subject,
            agentKind: t.agentKind,
            status: t.status,
            createdAt: t.createdAt.toISOString(),
            latestBody: t.messages[0]?.body,
          })),
        });
      },
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = postSchema.safeParse(body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const wallet = parsed.data.walletAddress.toLowerCase();
        const prisma = getPrisma();

        let draftText = `Draft queued for ${parsed.data.agentKind} agent.\n\nUser request:\n${parsed.data.body}`;

        if (parsed.data.agentKind === "research") {
          try {
            const q = encodeURIComponent(parsed.data.body.slice(0, 500));
            const res = await fetch(
              new URL(`/api/agents/research?q=${q}`, request.url).toString(),
              { headers: request.headers },
            );
            if (res.ok) {
              const text = await res.text();
              draftText = text.slice(0, 4000);
            }
          } catch {
            /* fallback draft */
          }
        }

        if (parsed.data.agentKind === "replay") {
          draftText = [
            "Replay Guy draft queued for your review.",
            "",
            "Monitored context:",
            parsed.data.body.slice(0, 2000),
            "",
            "Suggested reply (edit before approve):",
            "— Thanks for engaging. [Human: customize voice and send from inbox when ready.]",
            "",
            "No outbound send until you approve in inbox or outreach flow.",
          ].join("\n");
        }

        if (prisma) {
          const thread = await prisma.agentInboxThread.create({
            data: {
              walletAddress: wallet,
              subject: parsed.data.subject,
              agentKind: parsed.data.agentKind,
              status: "draft",
              messages: {
                create: [
                  { role: "user", body: parsed.data.body },
                  {
                    role: "agent",
                    body: draftText,
                    draftJson: { agentKind: parsed.data.agentKind },
                  },
                ],
              },
            },
          });

          await recordCultureMemoryEvent({
            wallet,
            type: "agent_inbox_draft",
            agentRef: parsed.data.agentKind,
            payload: { threadId: thread.id, subject: parsed.data.subject },
          });
        }

        return json({ ok: true, draft: draftText });
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
