import { lazy, Suspense, useEffect } from "react";
import { motion } from "framer-motion";

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingProblem } from "@/components/landing/LandingProblem";
import { LandingVision } from "@/components/landing/LandingVision";
import { LandingEcosystem } from "@/components/landing/LandingEcosystem";
import { LandingCultureLayer } from "@/components/landing/LandingCultureLayer";
import { LandingImpact } from "@/components/landing/LandingImpact";
import { LandingInvestors } from "@/components/landing/LandingInvestors";
import { LandingFuture } from "@/components/landing/LandingFuture";
import { LandingFinalCta } from "@/components/landing/LandingFinalCta";
import { trackLandingEvent } from "@/lib/landing-api";

const LandingHero = lazy(() =>
  import("@/components/landing/LandingHero").then((m) => ({ default: m.LandingHero })),
);
const LandingBcd = lazy(() =>
  import("@/components/landing/LandingBcd").then((m) => ({ default: m.LandingBcd })),
);

function SectionFallback() {
  return <motion.div className="min-h-[40vh] bg-[#050505]" />;
}

export function LandingPage() {
  useEffect(() => {
    void trackLandingEvent("page_view", "landing", { path: "/" });
  }, []);

  return (
    <motion.div className="bc-surface min-h-screen antialiased">
      <LandingNav />
      <main>
        <Suspense fallback={<SectionFallback />}>
          <LandingHero />
        </Suspense>
        <LandingProblem />
        <LandingVision />
        <LandingEcosystem />
        <LandingCultureLayer />
        <Suspense fallback={<SectionFallback />}>
          <LandingBcd />
        </Suspense>
        <LandingImpact />
        <LandingInvestors />
        <LandingFuture />
        <LandingFinalCta />
      </main>
    </motion.div>
  );
}
