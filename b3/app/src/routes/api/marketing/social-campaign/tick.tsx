import { createFileRoute } from "@tanstack/react-router";

import { socialCampaignAdminSecret } from "@/server/marketing/social-campaign/env";
import { runSocialCampaignTick } from "@/server/marketing/social-campaign/tick";

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/marketing/social-campaign/tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = socialCampaignAdminSecret();
        if (!expected) return unauthorized();
        const hdr =
          request.headers.get("x-social-campaign-admin-secret") ||
          request.headers.get("x-x-marketing-admin-secret");
        if (hdr !== expected) return unauthorized();

        let body: Record<string, unknown> = {};
        try {
          const raw = await request.text();
          if (raw.trim()) body = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const url = new URL(request.url);
        const dryRun =
          body.dryRun === true ||
          (typeof body.dryRun === "string" && body.dryRun.toLowerCase() === "true") ||
          url.searchParams.get("dryRun") === "1";
        const assetId = typeof body.assetId === "string" ? body.assetId : undefined;
        const account =
          body.account === "official" || body.account === "grove" ? body.account : undefined;

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        const result = await runSocialCampaignTick(prisma, { dryRun, assetId, account });

        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
      GET: async () => {
        const {
          socialCampaignAutoPostEnabled,
          socialCampaignDailyCapGrove,
          socialCampaignDailyCapOfficial,
          socialCampaignPublishingPaused,
        } = await import("@/server/marketing/social-campaign/env");
        const { SOCIAL_CAMPAIGN_MANIFEST } = await import("@/content/social-campaign/manifest");
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();

        return new Response(
          JSON.stringify({
            ok: true,
            agent: "social-campaign-1",
            autoPost: socialCampaignAutoPostEnabled(),
            publishingPaused: socialCampaignPublishingPaused(),
            dailyCapOfficial: socialCampaignDailyCapOfficial(),
            dailyCapGrove: socialCampaignDailyCapGrove(),
            adminSecretConfigured: Boolean(socialCampaignAdminSecret()),
            database: Boolean(prisma),
            assetCount: SOCIAL_CAMPAIGN_MANIFEST.assets.length,
          }),
          { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
        );
      },
    },
  },
  component: SocialCampaignTickNote,
});

function SocialCampaignTickNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">Social campaign agent</p>
      <p>
        <span className="text-zinc-300">GET</span> — status ·{" "}
        <span className="text-zinc-300">POST</span> — run tick (header{" "}
        <span className="text-zinc-300">x-social-campaign-admin-secret</span> or{" "}
        <span className="text-zinc-300">x-x-marketing-admin-secret</span>)
      </p>
    </div>
  );
}
