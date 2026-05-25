import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { SignalStrip } from "@/components/SignalStrip";
import { Happening } from "@/components/scenes/Happening";
import { BankVsCommunity } from "@/components/scenes/BankVsCommunity";
import { TwoFutures } from "@/components/scenes/TwoFutures";
import { Ripple } from "@/components/scenes/Ripple";
import { Project } from "@/components/Project";
import { YouDecide } from "@/components/scenes/YouDecide";
import { Community } from "@/components/Community";
import { FinalHook } from "@/components/FinalHook";
import { Footer } from "@/components/Footer";
import { PropertyStripFooter } from "@/components/property/PropertyStripFooter";
import { useDocumentTitle } from "@/hooks/use-document-title";
import type { BcTheme } from "@/lib/theme";
import { themeMeta } from "@/lib/theme";

export function ThemedStoryline({ theme }: { theme: BcTheme }) {
  useDocumentTitle(themeMeta[theme].documentTitle);

  return (
    <main id="bc-final-immersive" data-theme={theme} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav theme={theme} />
      <Hero />
      <SignalStrip />
      <Happening />
      <BankVsCommunity />
      <TwoFutures />
      <Ripple />
      <Project />
      <YouDecide />
      <Community />
      <FinalHook />
      <PropertyStripFooter />
      <Footer />
    </main>
  );
}
