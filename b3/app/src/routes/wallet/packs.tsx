import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { formatCulturePoints } from "@/lib/packs";
import {
  PackCheckoutActionsLegacy,
  PackCheckoutActionsPrivy,
} from "@/components/wallet/PackCheckoutActions";
import { ModuleShell } from "@/components/ModuleShell";
import { WalletControls } from "@/components/WalletControls";
import { pageHead } from "@/lib/seo";
import { privyEnabled } from "@/lib/privy-env";

type PacksSearch = {
  checkout?: string;
  pack?: string;
};

export const Route = createFileRoute("/wallet/packs")({
  validateSearch: (search: Record<string, unknown>): PacksSearch => ({
    checkout: typeof search.checkout === "string" ? search.checkout : undefined,
    pack: typeof search.pack === "string" ? search.pack : undefined,
  }),
  head: () =>
    pageHead({
      title: "Culture packs",
      description:
        "Buy Culture Points with USD. Loyalty credits for quests, perks, and future BCD redemption.",
      path: "/wallet/packs",
    }),
  component: WalletPacksPage,
});

function WalletPacksPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { address } = useAccount();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (search.checkout === "success") {
      toast.success("Payment received", {
        description: "Culture Points credit shortly after Stripe confirms.",
      });
      void navigate({ to: "/wallet/packs", search: {}, replace: true });
    }
  }, [search.checkout, navigate]);

  useEffect(() => {
    if (!address) return;
    void fetch(`/api/rewards/summary?address=${address}`)
      .then((r) => r.json())
      .then((data: { ok?: boolean; culturePoints?: number }) => {
        if (data.ok) setBalance(data.culturePoints ?? 0);
      })
      .catch(() => {});
  }, [address, search.checkout]);

  return (
    <ModuleShell
      moduleId="pass"
      title="Culture packs"
      subtitle="USD checkout via Stripe. Points are loyalty credits — not securities. Redeem for BCD when liquidity allows."
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-col items-center gap-4">
          <WalletControls />
          {balance !== null && (
            <p className="font-mono text-sm text-[#C5FF41]">
              Balance: {formatCulturePoints(balance)} Culture Points
            </p>
          )}
        </div>

        <p className="text-center text-xs text-zinc-500">
          Culture Points power quests, forest progression, and future token redemption. Purchases
          are non-refundable loyalty credits.
        </p>

        {privyEnabled ? <PackCheckoutActionsPrivy /> : <PackCheckoutActionsLegacy />}

        <p className="text-center text-[10px] text-zinc-600">
          Whale tier ($7,777,777) may require manual Stripe account approval before going live.
        </p>
      </div>
    </ModuleShell>
  );
}
