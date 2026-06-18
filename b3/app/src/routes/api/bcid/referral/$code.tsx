import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/bcid/referral/$code")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const code = params?.code;
        if (!code || code.length < 4) {
          return Response.json({ ok: false, error: "invalid_code" }, { status: 400 });
        }

        const { getServerPublicOrigin } = await import("@/lib/app-origin");
        const origin = getServerPublicOrigin();

        return Response.json({
          ok: true,
          referralCode: code,
          mintUrl: `${origin}/bcid/mint?ref=${encodeURIComponent(code)}`,
          rewardBcc: { referrer: 10, referee: 5 },
          cap: 5,
        });
      },
    },
  },
  component: () => null,
});
