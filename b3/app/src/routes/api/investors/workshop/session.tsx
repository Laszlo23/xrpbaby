import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/investors/workshop/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { investorWorkshopEnabled, verifyWorkshopToken } = await import(
          "@/server/investors/workshop-auth"
        );
        if (!investorWorkshopEnabled()) {
          return json({ ok: false, enabled: false, error: "workshop_not_configured" }, 503);
        }
        const token = bearerToken(request);
        const authorized = verifyWorkshopToken(token);
        return json({ ok: authorized, enabled: true, authorized });
      },
      POST: async ({ request }) => {
        const {
          investorWorkshopEnabled,
          issueWorkshopToken,
          verifyWorkshopPassword,
        } = await import("@/server/investors/workshop-auth");

        if (!investorWorkshopEnabled()) {
          return json({ ok: false, enabled: false, error: "workshop_not_configured" }, 503);
        }

        let body: { password?: string } = {};
        try {
          const raw = await request.text();
          if (raw.trim()) body = JSON.parse(raw) as { password?: string };
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const password = typeof body.password === "string" ? body.password : "";
        if (!password || !verifyWorkshopPassword(password)) {
          return json({ ok: false, error: "invalid_password" }, 401);
        }

        const secret = process.env.INVESTOR_WORKSHOP_SECRET!.trim();
        return json({
          ok: true,
          enabled: true,
          token: issueWorkshopToken(secret),
        });
      },
    },
  },
  component: () => null,
});

function bearerToken(request: Request): string | null {
  const hdr = request.headers.get("authorization")?.trim();
  if (!hdr?.toLowerCase().startsWith("bearer ")) return null;
  return hdr.slice(7).trim() || null;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
