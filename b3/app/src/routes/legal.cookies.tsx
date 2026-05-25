import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalProse } from "@/components/LegalProse";

export const Route = createFileRoute("/legal/cookies")({
  head: () =>
    pageHead({
      title: "Cookie Policy",
      description:
        "Cookie and similar technologies notice for BUILDCHAIN — placeholder until counsel review.",
      path: "/legal/cookies",
      keywords: ["BUILDCHAIN", "cookies", "policy"],
    }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalProse title="Cookie Policy" counselBanner>
      <p>
        Describe essential vs. analytics vs. marketing cookies, retention, and how users can consent
        or withdraw—aligned with your analytics (if any) and embedded wallets or CDNs.
      </p>
      <p>
        If you only use strictly necessary cookies, say so. If you load third-party scripts,
        disclose them and link to their policies.
      </p>
    </LegalProse>
  );
}
