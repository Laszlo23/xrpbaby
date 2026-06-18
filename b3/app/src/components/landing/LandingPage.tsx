import { lazy, Suspense, useEffect } from "react";

import { LandingMotionRoot, motion } from "@/components/landing/motion";

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingWhyNow } from "@/components/landing/LandingWhyNow";
import { LandingEcosystemFlow } from "@/components/landing/LandingEcosystemFlow";
import { LandingFounderTimeline } from "@/components/landing/LandingFounderTimeline";
import { LandingProblem } from "@/components/landing/LandingProblem";
import { LandingProducts } from "@/components/landing/LandingProducts";
import { LandingSuccessStories } from "@/components/landing/LandingSuccessStories";
import { LandingManifesto } from "@/components/landing/LandingManifesto";
import { LandingPlaces } from "@/components/landing/LandingPlaces";
import { LandingVision } from "@/components/landing/LandingVision";
import { LandingEcosystem } from "@/components/landing/LandingEcosystem";
import { LandingCultureLayer } from "@/components/landing/LandingCultureLayer";
import { LandingEcosystemMap } from "@/components/landing/LandingEcosystemMap";
import { LandingImpact } from "@/components/landing/LandingImpact";
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
    <LandingMotionRoot>
      <motion.div className="bc-surface min-h-screen antialiased">
        <LandingNav />
        <main>
        <Suspense fallback={<SectionFallback />}>
          <LandingHero />
        </Suspense>
        <LandingWhyNow />
        <LandingEcosystemFlow />
        <LandingEcosystemMap />
        <LandingProducts />
        <LandingProblem />
        <LandingSuccessStories />
        <LandingManifesto />
        <LandingPlaces />
        <LandingVision />
        <LandingFounderTimeline />
        <LandingEcosystem />
        <LandingCultureLayer />
        <Suspense fallback={<SectionFallback />}>
          <LandingBcd />
        </Suspense>
        <LandingImpact />
        <LandingFuture />
        <LandingFinalCta />
        </main>
      </motion.div>
    </LandingMotionRoot>
  );
}
