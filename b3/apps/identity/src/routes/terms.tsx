import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { pageMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageMeta({
      title: "Terms · Culture Layer",
      description: "Terms of use for Culture Layer identity NFTs on Base.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPageLayout title="Terms of use">
      <section className="space-y-3">
        <h2 className="font-display text-base font-medium text-foreground">The product</h2>
        <p>
          Culture Layer lets you mint a transferable ERC-721 identity NFT tied to a name on
          supported TLDs (.culture, .build, .home, and others). Minting costs approximately $1.11
          USD, paid in ETH on Base at the on-chain <code>mintPrice</code>, plus network gas fees.
          The ETH amount may be updated by the contract owner when exchange rates move.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-base font-medium text-foreground">No guarantees</h2>
        <p>
          The service is provided as-is. We do not guarantee name availability after mint,
          secondary-market value, or permanent resolution of social or basename data shown on
          profiles.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-base font-medium text-foreground">Your responsibility</h2>
        <p>
          You are responsible for securing your wallet, reviewing transactions before signing,
          and complying with applicable laws. Names must not infringe others&apos; rights or
          impersonate others.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-base font-medium text-foreground">Governing law</h2>
        <p>
          These terms will be updated with a governing jurisdiction before general availability.
          Until then, use the product at your own discretion.
        </p>
      </section>
    </LegalPageLayout>
  );
}
