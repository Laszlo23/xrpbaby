import { createFileRoute } from "@tanstack/react-router";

import { ModuleShell } from "@/components/ModuleShell";
import { CulturePulsePage } from "@/components/pulse/CulturePulsePage";
import { platformModules } from "@/lib/modules";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/signal/")({
  component: SignalPage,
  head: () =>
    pageHead({
      title: "Culture Pulse",
      description:
        "Track community growth, social momentum, and daily pulse signals across BUILDCHAIN.",
      path: "/signal",
      keywords: ["BUILDCHAIN", "culture pulse", "community", "social feed"],
    }),
});

function SignalPage() {
  if (!platformModules.signal) {
    return <p className="p-8 text-white">Signal module off.</p>;
  }
  return (
    <ModuleShell
      moduleId="signal"
      title="Culture Pulse"
      subtitle="One public view of forest growth, Web2 and Web3 social streams, and community conversation — anchored on Base daily."
    >
      <CulturePulsePage />
    </ModuleShell>
  );
}
