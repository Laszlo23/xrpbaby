import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { pageMeta } from "@/lib/seo/meta";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageMeta({
      title: "Privacy · Culture Layer",
      description:
        "How Culture Layer handles wallet and social data when you use our identity product.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy">
      <section className="space-y-3">
        <h2 className="font-display text-base font-medium text-foreground">What we collect</h2>
        <p>
          When you connect a wallet, we read public onchain data (contract state, NFT ownership,
          transaction hashes) to show your identity profile. If your wallet is linked to Farcaster,
          we fetch public social data (profile, casts, channels) via Neynar on our servers only —
          API keys are never exposed to the browser.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-base font-medium text-foreground">What we do not do</h2>
        <p>
          We do not sell personal data. We do not store private keys. We do not require an email
          account to mint an identity NFT.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-base font-medium text-foreground">Third parties</h2>
        <p>
          Blockchain networks (Base), indexers, and optional providers (e.g. Neynar, Alchemy)
          process data under their own policies when you use the product.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-base font-medium text-foreground">Contact</h2>
        <p>
          Questions: reach us in our{" "}
          <a
            href="https://discord.gg/cze3fPkzEC"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Discord community
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
