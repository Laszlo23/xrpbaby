import type { Metadata } from "next";
import { StartWizard } from "@/components/onboarding/StartWizard";

export const metadata: Metadata = {
  title: "Start here",
  description:
    "Plain-English introduction to Building Culture: what it is, what you need, how to connect a wallet, and where to browse properties.",
};

export default function StartPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-0">
      <StartWizard />
    </div>
  );
}
