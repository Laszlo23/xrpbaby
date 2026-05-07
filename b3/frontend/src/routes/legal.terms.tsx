import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalProse } from "@/components/LegalProse";

export const Route = createFileRoute("/legal/terms")({
  head: () =>
    pageHead({
      title: "Terms of Service",
      description: "Terms governing use of BUILDCHAIN products, drops, and digital collectibles.",
      path: "/legal/terms",
      keywords: ["BUILDCHAIN", "terms", "legal"],
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalProse title="Terms of Service" counselBanner>
      <p>
        These terms are non-binding placeholder text. Before inviting users or handling payments,
        publish terms tailored to your entity, jurisdiction, product risks, and dispute resolution.
      </p>
      <p>
        By accessing BUILDCHAIN you agree you have read and understood that drops may involve loss
        of funds, tax obligations, and regulatory considerations in your region.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>No warranty of winnings or asset availability.</li>
        <li>Smart-contract behavior prevails where applicable; UI is illustrative.</li>
        <li>You are responsible for securing your wallet and keys.</li>
      </ul>
    </LegalProse>
  );
}
