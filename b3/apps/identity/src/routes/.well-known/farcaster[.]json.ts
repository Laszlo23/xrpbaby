import { createFileRoute } from "@tanstack/react-router";
import { MINI_APP_ORIGIN } from "@/lib/mini/site";

const manifest = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Culture Layer",
    homeUrl: `${MINI_APP_ORIGIN}/`,
    iconUrl: `${MINI_APP_ORIGIN}/mini/icon-1024.png`,
    splashImageUrl: `${MINI_APP_ORIGIN}/mini/splash-200.png`,
    splashBackgroundColor: "#0a0a0a",
    subtitle: "Onchain identity quests",
    description:
      "Mint your .culture identity, complete social quests, and climb the leaderboard on Base.",
    primaryCategory: "social",
    tags: ["identity", "base", "nft", "social", "culture"],
    requiredChains: ["eip155:8453"],
    requiredCapabilities: [
      "actions.ready",
      "actions.signIn",
      "actions.composeCast",
      "wallet.getEthereumProvider",
    ],
    heroImageUrl: `${MINI_APP_ORIGIN}/mini/og-1200x630.png`,
    ogImageUrl: `${MINI_APP_ORIGIN}/mini/og-1200x630.png`,
    ogTitle: "Culture Layer",
    ogDescription: "Own your onchain identity. Complete quests. Earn XP.",
  },
};

export const Route = createFileRoute("/.well-known/farcaster.json")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(manifest, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        }),
    },
  },
});
