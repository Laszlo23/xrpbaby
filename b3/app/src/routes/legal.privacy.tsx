import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalProse } from "@/components/LegalProse";

export const Route = createFileRoute("/legal/privacy")({
  head: () =>
    pageHead({
      title: "Privacy Policy",
      description:
        "How BUILDCHAIN handles personal data — placeholder policy; replace before production.",
      path: "/legal/privacy",
      keywords: ["BUILDCHAIN", "privacy", "policy"],
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalProse title="Privacy Policy" counselBanner>
      <p>
        Replace this page with a privacy policy aligned to GDPR, ePrivacy, and any US state laws
        that apply to your users and analytics stack.
      </p>
      <p>
        Typical topics to cover: categories of data collected (wallet addresses, usage analytics),
        purposes, retention, subprocessors, international transfers, and user rights (access,
        deletion).
      </p>
      <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm">
        Contact: add a privacy inbox before launch.
      </p>
    </LegalProse>
  );
}
