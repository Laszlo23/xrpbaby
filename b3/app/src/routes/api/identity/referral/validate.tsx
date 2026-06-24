import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/identity/referral/validate")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code")?.trim() ?? "";
        const wallet = url.searchParams.get("wallet")?.trim() ?? "";
        const handle = url.searchParams.get("handle")?.trim() ?? "";

        if (!code || !wallet || !handle) {
          return Response.json({ ok: false, error: "missing_params" }, { status: 400 });
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
          return Response.json({ ok: false, error: "invalid_wallet" }, { status: 400 });
        }

        const { isTeamReferralCode } = await import("@/server/identity/referral-codes");
        const { isIdentityTeamWallet, validateHandleForPromoMintWallet } =
          await import("@/lib/identity/handle-policy");
        const { usdPriceForTotalMinted } = await import("@/lib/identity/mint-ladder");

        const teamMintWallet = isIdentityTeamWallet(wallet);
        const tierUsd = usdPriceForTotalMinted(0);

        const policy = validateHandleForPromoMintWallet(handle, wallet);
        if (!policy.ok) {
          return Response.json(
            { ok: false, error: policy.error, teamMintWallet, reusable: false },
            { status: 400 },
          );
        }

        // Team master codes are issued personally — never valid via public entry.
        if (isTeamReferralCode(code)) {
          return Response.json(
            { ok: false, error: "code_invalid", teamMintWallet, reusable: false },
            { status: 403 },
          );
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });
        }

        try {
          const { validateReferralForMint } = await import("@/server/identity/referral-codes");
          const result = await validateReferralForMint(prisma, { wallet, code, handle });
          if (!result.ok) {
            const status =
              result.error === "reserved_team" || result.error === "handle_too_short" ? 400 : 403;
            return Response.json({ ...result, teamMintWallet, reusable: false }, { status });
          }

          return Response.json({
            ok: true,
            code: result.code,
            isLaunchCode: result.isLaunchCode,
            teamMintWallet,
            reusable: false,
            tierUsd,
            referralMintPoints: 25,
          });
        } catch {
          return Response.json({ ok: false, error: "db_unavailable" }, { status: 503 });
        }
      },
    },
  },
  component: () => null,
});
