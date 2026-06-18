import { useEffect } from "react";
import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { AppFooter } from "@/components/AppFooter";
import { Web3Provider } from "@/components/Web3Provider";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Toaster } from "@/components/ui/sonner";
import { BcdEconomyProvider } from "@/contexts/BcdEconomyContext";
import { GetBcdModal } from "@/components/GetBcdModal";
import { BuyBccButton } from "@/components/bcc/BuyBccModal";
import { AiCoachProvider } from "@/contexts/AiCoachContext";
import { AiPulseCoach } from "@/components/AiPulseCoach";
import { EliasOrb } from "@/components/EliasOrb";
import { EliasOnboarding } from "@/components/EliasOnboarding";
import { PanicSwitchOverlay } from "@/components/PanicSwitchOverlay";
import { buildPathAwareFarcasterEmbedMetaAsync } from "@/lib/farcaster-embed-meta";
import { AnalyticsRouteTracker } from "@/components/AnalyticsRouteTracker";
import { FarcasterMiniAppReady } from "@/components/FarcasterMiniAppReady";
import { TelegramMiniAppReady } from "@/components/TelegramMiniAppReady";
import { JsonLd } from "@/components/JsonLd";
import { BuilderVoicePrompt } from "@/components/BuilderVoicePrompt";
import { buildWebsiteJsonLd, getDefaultOgImageUrl, pageHead, rootFontPreconnectLinks, rootIconLinks, rootTechnicalMeta } from "@/lib/seo";
import { registerPwaServiceWorker } from "@/lib/pwa";

import appCss from "../styles.css?url";
import "@neynar/react/dist/style.css";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: async (ctx) => {
    const isNotFound = ctx.matches.some(
      (m) => Boolean(m.globalNotFound) || m.status === "notFound",
    );
    const pathname =
      ctx.matches.find((m) => m.globalNotFound)?.pathname ??
      ctx.matches.find((m) => m.status === "notFound")?.pathname ??
      ctx.match.pathname;

    const fcPath = isNotFound ? "/" : ctx.match.pathname;
    const fcEmbedMetaJson = await buildPathAwareFarcasterEmbedMetaAsync(fcPath);
    const baseMeta = [
      ...rootTechnicalMeta(),
      { name: "fc:miniapp", content: fcEmbedMetaJson },
      { name: "fc:frame", content: fcEmbedMetaJson },
    ];

    if (isNotFound) {
      const nf = pageHead({
        title: "Page not found",
        description:
          "This URL is not part of Build Culture. Use the home link or navigation to find drops, marketplace, and docs.",
        path: pathname,
        noIndex: true,
      });
      return {
        meta: [...baseMeta, ...nf.meta],
        links: [{ rel: "stylesheet", href: appCss }, ...rootFontPreconnectLinks(), ...rootIconLinks(), ...nf.links],
      };
    }

    return {
      meta: baseMeta,
      links: [{ rel: "stylesheet", href: appCss }, ...rootFontPreconnectLinks(), ...rootIconLinks()],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <JsonLd id="jsonld-website" data={buildWebsiteJsonLd()} />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function useHideBottomNav(): boolean {
  const { pathname } = useLocation();
  if (pathname === "/") return true;
  if (pathname.startsWith("/join")) return true;
  if (pathname.startsWith("/welcome")) return true;
  if (pathname.startsWith("/tg")) return true;
  if (pathname.startsWith("/intelligence")) return true;
  if (pathname.startsWith("/id")) return true;
  return false;
}

function useMinimalAppChrome(): boolean {
  const { pathname } = useLocation();
  return pathname === "/tg" || pathname === "/tg/";
}

function AppChrome() {
  const hideBottomNav = useHideBottomNav();
  return (
    <>
      <AppFooter withBottomNav={!hideBottomNav} />
      {!hideBottomNav ? <BottomNav /> : null}
    </>
  );
}

function RootComponent() {
  const { pathname } = useLocation();

  useEffect(() => {
    void import("@/lib/sentry").then((m) => m.initClientSentry());
    registerPwaServiceWorker();
  }, []);

  const minimalChrome = useMinimalAppChrome();

  return (
    <Web3Provider>
      <BcdEconomyProvider>
        <AiCoachProvider>
          <NetworkGuard />
          <AnalyticsRouteTracker />
          <FarcasterMiniAppReady />
          {minimalChrome ? <TelegramMiniAppReady /> : null}
          <div className="relative min-h-dvh w-full max-w-[100vw] overflow-x-hidden">
            <Outlet />
            {!minimalChrome ? <AppChrome /> : null}
          </div>
          {!minimalChrome ? (
            <>
              <GetBcdModal />
              <BuyBccButton />
              <EliasOnboarding />
              <EliasOrb />
              <PanicSwitchOverlay />
              <AiPulseCoach />
            </>
          ) : null}
          {!minimalChrome && !pathname.startsWith("/voice") ? (
            <BuilderVoicePrompt pathname={pathname} />
          ) : null}
          <Toaster richColors position="top-center" />
        </AiCoachProvider>
      </BcdEconomyProvider>
    </Web3Provider>
  );
}
