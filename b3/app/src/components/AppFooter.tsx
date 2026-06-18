import { LandingFooter } from "@/components/landing/LandingFooter";

type AppFooterProps = {
  /** @deprecated Mega footer variants removed — compact footer only. */
  variant?: "focused";
  /** When true, add safe-area padding for bottom nav */
  withBottomNav?: boolean;
};

/** Global compact footer — same layout as landing. Deep links live on /ecosystem, /guide, and /faq. */
export function AppFooter({ withBottomNav = false }: AppFooterProps) {
  return <LandingFooter withBottomNav={withBottomNav} />;
}

/** @deprecated Use AppFooter */
export function SiteFooter() {
  return <AppFooter withBottomNav />;
}
