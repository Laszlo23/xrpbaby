import { useEffect } from "react";
import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { BottomNav } from "@/components/BottomNav";
import { AppFooter } from "@/components/AppFooter";
import { LoggedInShell } from "@/components/layout/LoggedInShell";
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
import {
  buildWebsiteJsonLd,
  getDefaultOgImageUrl,
  pageHead,
  rootFontPreconnectLinks,
  rootIconLinks,
  rootTechnicalMeta,
} from "@/lib/seo";
import { NotFoundPage } from "@/components/NotFoundPage";
import { registerPwaServiceWorker } from "@/lib/pwa";

import appCss from "../styles.css?url";
import "@neynar/react/dist/style.css";

function NotFoundComponent() {
  return <NotFoundPage />;
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
        title: "Under development",
        description:
          "This page is still being built. Head home, open founding quests, or create your Culture pass.",
        path: pathname,
        noIndex: true,
      });
      return {
        meta: [...baseMeta, ...nf.meta],
        links: [
          { rel: "stylesheet", href: appCss },
          ...rootFontPreconnectLinks(),
          ...rootIconLinks(),
          ...nf.links,
        ],
      };
    }

    return {
      meta: baseMeta,
      links: [
        { rel: "stylesheet", href: appCss },
        ...rootFontPreconnectLinks(),
        ...rootIconLinks(),
      ],
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

function useShowLoggedInShell(): boolean {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  if (!isConnected) return false;
  if (pathname === "/") return false;
  if (pathname.startsWith("/join")) return false;
  if (pathname.startsWith("/welcome")) return false;
  if (pathname.startsWith("/tg")) return false;
  if (pathname.startsWith("/intelligence")) return false;
  if (pathname.startsWith("/id")) return false;
  return true;
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
      <RootAppContent minimalChrome={minimalChrome} pathname={pathname} />
    </Web3Provider>
  );
}

function RootAppContent({ minimalChrome, pathname }: { minimalChrome: boolean; pathname: string }) {
  const showLoggedInShell = useShowLoggedInShell();

  return (
    <BcdEconomyProvider>
      <AiCoachProvider>
        <NetworkGuard />
        <AnalyticsRouteTracker />
        <FarcasterMiniAppReady />
        {minimalChrome ? <TelegramMiniAppReady /> : null}
        <div className="relative min-h-dvh w-full max-w-[100vw] overflow-x-hidden">
          {showLoggedInShell ? <LoggedInShell /> : null}
          <div className={showLoggedInShell ? "pt-[7.5rem] sm:pt-[8.5rem]" : undefined}>
            <Outlet />
          </div>
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
  );
}
