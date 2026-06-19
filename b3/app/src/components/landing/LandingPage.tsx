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
  return (
    <motion.div className="min-h-[40vh] bg-[#050505] px-5 pt-32 sm:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-4 w-32 rounded-full bg-white/10" />
        <div className="h-16 w-full max-w-3xl rounded-2xl bg-white/10" />
        <div className="h-6 w-full max-w-xl rounded-full bg-white/10" />
        <div className="flex gap-3 pt-4">
          <div className="h-12 w-40 rounded-full bg-[#C5FF41]/20" />
          <div className="h-12 w-44 rounded-full bg-white/10" />
        </div>
      </div>
    </motion.div>
  );
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
