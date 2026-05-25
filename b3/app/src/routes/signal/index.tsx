import { createFileRoute } from "@tanstack/react-router";

import { ModuleShell } from "@/components/ModuleShell";
import { CulturePulsePage } from "@/components/pulse/CulturePulsePage";
import { platformModules } from "@/lib/modules";

export const Route = createFileRoute("/signal/")({
  component: SignalPage,
  head: () => ({
    meta: [{ title: "Culture Pulse — Building Culture" }],
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
