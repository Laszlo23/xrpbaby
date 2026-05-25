import { createFileRoute } from "@tanstack/react-router";

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
  return <CulturePulsePage />;
}
