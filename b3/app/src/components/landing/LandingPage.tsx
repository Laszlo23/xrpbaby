import { lazy, Suspense, useEffect } from "react";

import { LandingMotionRoot, motion } from "@/components/landing/motion";

import { LandingNav } from "@/components/landing/LandingNav";
import { LandingCultureIdExample } from "@/components/landing/LandingCultureIdExample";
import { LandingEcosystemFlow } from "@/components/landing/LandingEcosystemFlow";
import { LandingWhyNow } from "@/components/landing/LandingWhyNow";
import { LandingFounderTimeline } from "@/components/landing/LandingFounderTimeline";
import { LandingProducts } from "@/components/landing/LandingProducts";
import { LandingSuccessStories } from "@/components/landing/LandingSuccessStories";
import { LandingEcosystemTeaser } from "@/components/landing/LandingEcosystemTeaser";
import { LandingFinalCta } from "@/components/landing/LandingFinalCta";
import { trackLandingEvent } from "@/lib/landing-api";

const LandingHero = lazy(() =>
  import("@/components/landing/LandingHero").then((m) => ({ default: m.LandingHero })),
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
          <LandingCultureIdExample />
          <LandingEcosystemFlow />
          <LandingProducts />
          <LandingWhyNow />
          <LandingSuccessStories />
          <LandingFounderTimeline />
          <LandingEcosystemTeaser />
          <LandingFinalCta />
        </main>
      </motion.div>
    </LandingMotionRoot>
  );
}
