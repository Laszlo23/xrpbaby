import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalProse } from "@/components/LegalProse";

export const Route = createFileRoute("/legal/imprint")({
  head: () =>
    pageHead({
      title: "Imprint",
      description:
        "Legal disclosure and contact — Building Culture LLC (Delaware) and registered agent details.",
      path: "/legal/imprint",
      keywords: ["BUILDCHAIN", "imprint", "Impressum", "legal"],
    }),
  component: ImprintPage,
});

const CONTACT_EMAIL = "office@buildingculture.capital";

function ImprintPage() {
  return (
    <LegalProse title="Imprint / Legal disclosure" counselBanner>
      <p>
        Publication details for operators subject to transparency rules (including EU-style
        disclosures where applicable). For Austria-specific statutory requirements, confirm final
        wording with counsel when you materially change structure or offerings.
      </p>
      <dl className="space-y-3 font-mono text-sm text-zinc-500">
        <div>
          <dt className="text-zinc-600">Entity name</dt>
          <dd className="text-zinc-400">Building Culture LLC</dd>
        </div>
        <div>
          <dt className="text-zinc-600">Formation</dt>
          <dd className="text-zinc-400">
            Delaware, United States · file reference{" "}
            <span className="text-zinc-300">#525</span>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-600">Registered agent</dt>
          <dd className="text-zinc-400">
            131 Continental Drive Suite 305
            <br />
            Newark
            <br />
            New Castle County, Delaware 19713
            <br />
            United States
          </dd>
        </div>
        <div>
          <dt className="text-zinc-600">Contact</dt>
          <dd className="text-zinc-400">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-zinc-200 underline underline-offset-4 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
          </dd>
        </div>
      </dl>
    </LegalProse>
  );
}
