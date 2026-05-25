"use client";

import { usePathname } from "next/navigation";
import { BetaWelcomeModal } from "@/components/BetaWelcomeModal";
import { ChainSwitchBanner } from "@/components/ChainSwitchBanner";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

const IMMERSIVE_PATH = "/experience";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = pathname === IMMERSIVE_PATH || pathname === `${IMMERSIVE_PATH}/`;

  if (immersive) {
    return (
      <>
        <InAppBrowserBanner />
        {children}
      </>
    );
  }

  return (
    <>
      <InAppBrowserBanner />
      <BetaWelcomeModal />
      <Nav />
      <ChainSwitchBanner />
      <main className="relative mx-auto min-h-[60vh] w-full max-w-[1280px] px-4 py-8 sm:px-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
