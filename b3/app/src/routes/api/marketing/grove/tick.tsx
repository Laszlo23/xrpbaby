import { createFileRoute } from "@tanstack/react-router";

import { groveMarketingAdminSecret } from "@/server/marketing/grove/env";
import { runGroveTick } from "@/server/marketing/grove/tick";

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/marketing/grove/tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = groveMarketingAdminSecret();
        if (!expected) return unauthorized();
        const hdr =
          request.headers.get("x-grove-marketing-admin-secret") ||
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

        const dryRun =
          body.dryRun === true ||
          (typeof body.dryRun === "string" && body.dryRun.toLowerCase() === "true");
        const pillar = typeof body.pillar === "string" ? body.pillar : undefined;
        const attestationTxHash =
          typeof body.attestationTxHash === "string" ? body.attestationTxHash : undefined;

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        const result = await runGroveTick(prisma, { dryRun, pillar, attestationTxHash });

        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
      GET: async () => {
        const {
          groveAutoPostEnabled,
          groveFarcasterEnabled,
          grovePublishingPaused,
          groveScheduleProfile,
          groveTelegramEnabled,
          groveXEnabled,
        } = await import("@/server/marketing/grove/env");
        const { groveXConfigured, groveUsesOfficialXFallback } =
          await import("@/server/marketing/grove/x-client");
        const { groveFarcasterConfigured } =
          await import("@/server/marketing/grove/farcaster-post");
        const { groveTelegramConfigured } = await import("@/server/marketing/grove/telegram-post");
        const { buildGroveBrief } = await import("@/server/marketing/grove/brief");
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        const brief = await buildGroveBrief(prisma);

        return new Response(
          JSON.stringify({
            ok: true,
            agent: "grove-marketing-1",
            autoPost: groveAutoPostEnabled(),
            publishingPaused: grovePublishingPaused(),
            scheduleProfile: groveScheduleProfile(),
            xEnabled: groveXEnabled(),
            xConfigured: groveXConfigured(),
            xOfficialFallback: groveUsesOfficialXFallback(),
            farcasterEnabled: groveFarcasterEnabled(),
            farcasterConfigured: groveFarcasterConfigured(),
            telegramEnabled: groveTelegramEnabled(),
            telegramConfigured: groveTelegramConfigured(),
            adminSecretConfigured: Boolean(groveMarketingAdminSecret()),
            database: Boolean(prisma),
            briefPreview: {
              bccSource: brief.bcc.source,
              priceUsd: brief.bcc.priceUsd,
              marketCapUsd: brief.bcc.marketCapUsd,
              liquidityUsd: brief.bcc.liquidityUsd,
              memberCount: brief.pulse.memberCount,
            },
          }),
          { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
        );
      },
    },
  },
  component: GroveTickNote,
});

function GroveTickNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">Grove marketing agent</p>
      <p>
        <span className="text-zinc-300">GET</span> — status ·{" "}
        <span className="text-zinc-300">POST</span> — run tick (header{" "}
        <span className="text-zinc-300">x-grove-marketing-admin-secret</span>)
      </p>
    </div>
  );
}
