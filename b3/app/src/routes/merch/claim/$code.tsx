import { createFileRoute, Link } from "@tanstack/react-router";
import { QrCode } from "lucide-react";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { MerchClaimClient } from "@/components/marketplace/MerchClaimClient";
import { fetchMerchClaimPreviewFn } from "@/lib/marketplace/merch-claim-fn";

export const Route = createFileRoute("/merch/claim/$code")({
  head: ({ params }) =>
    pageHead({
      title: `Claim merch — ${BRAND_DISPLAY_NAME}`,
      description: "Scan your inside label QR to claim your limited-merch credential.",
      path: `/merch/claim/${params.code}`,
    }),
  loader: async ({ params }) => {
    try {
      return await fetchMerchClaimPreviewFn({ data: { code: params.code } });
    } catch {
      return { preview: null, cultureIdHandle: null };
    }
  },
  component: MerchClaimPage,
});

function MerchClaimPage() {
  const { preview, cultureIdHandle } = Route.useLoaderData();
  const { code } = Route.useParams();

  if (!preview) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-zinc-400">Invalid or unknown claim code.</p>
        <Link to="/marketplace/merch" className="mt-4 inline-block text-sm text-zinc-300 underline">
          Browse merch
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-12">
      <div className="flex items-center gap-3">
        <QrCode className="h-8 w-8 text-[var(--vault-gold)]" aria-hidden />
        <div>
          <h1 className="font-heading text-xl font-semibold text-white">Claim your tee</h1>
          <p className="text-sm text-zinc-500">{preview.dropTitle}</p>
        </div>
      </div>

      <MerchClaimClient code={code} preview={preview} cultureIdHandle={cultureIdHandle} />
    </div>
  );
}
