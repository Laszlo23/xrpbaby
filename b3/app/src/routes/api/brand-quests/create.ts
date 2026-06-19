import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { getBrandQuestEligibility } from "@/server/brand-quests/eligibility";
import { getPrisma } from "@/server/db/prisma";
import { recordCultureMemoryEvent } from "@/server/memory/timeline";

const postSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  title: z.string().min(3).max(120),
  storyMarkdown: z.string().min(20).max(12000),
  rewardPoints: z.number().int().min(10).max(10000).optional(),
  ticketPackSlug: z.string().optional(),
});

export const Route = createFileRoute("/api/brand-quests/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = postSchema.safeParse(body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const wallet = parsed.data.walletAddress.toLowerCase() as `0x${string}`;
        const { eligible } = await getBrandQuestEligibility(wallet);
        if (!eligible) {
          return json({ ok: false, error: "insufficient_bcc" }, 403);
        }

        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "database_unavailable" }, 503);
        }

        const quest = await prisma.brandStoryQuest.create({
          data: {
            creatorWallet: wallet,
            title: parsed.data.title,
            storyMarkdown: parsed.data.storyMarkdown,
            rewardPoints: parsed.data.rewardPoints ?? 100,
            ticketPackSlug: parsed.data.ticketPackSlug ?? "pack_triple_333",
            status: "active",
          },
        });

        await recordCultureMemoryEvent({
          wallet,
          type: "brand_quest_created",
          questId: quest.id,
          payload: { title: quest.title },
        });

        return json({ ok: true, questId: quest.id });
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
