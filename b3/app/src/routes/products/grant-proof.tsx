import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { ProductPageLayout } from "@/components/products/ProductPageLayout";
import { GRANT_PROOF_PRODUCT } from "@/lib/landing-copy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/products/grant-proof")({
  head: () =>
    pageHead({
      title: "Grant Proof — Transparent Impact Verification",
      description:
        "Track contributions, donations, rewards, grants, and community milestones — everything verifiable for grant reviewers and partners.",
      path: "/products/grant-proof",
      keywords: ["Grant Proof", "impact verification", "Building Culture", "due diligence"],
    }),
  component: GrantProofProductPage,
});

function GrantProofProductPage() {
  const pillar = GRANT_PROOF_PRODUCT;

  return (
    <ProductPageLayout pillar={pillar}>
      <div className="space-y-4 text-zinc-300">
        <h2 className="font-display text-2xl font-bold text-white">Proof you can download</h2>
        <p>
          Grant Proof runs live HTTP checks against production routes, on-chain contracts, and
          documented APIs — then packages results as downloadable JSON for reviewers.
        </p>
        <p>Contributions, agent milestones, identity contracts, and market health — all in one place.</p>
        <Link
          to="/grant-proof"
          className="inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
        >
          Run live verification
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </ProductPageLayout>
  );
}
