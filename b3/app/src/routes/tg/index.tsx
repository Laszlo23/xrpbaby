import { createFileRoute } from "@tanstack/react-router";
import { TelegramMiniApp } from "@/components/tg/TelegramMiniApp";
import { TelegramMiniAppReady } from "@/components/TelegramMiniAppReady";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/tg/")({
  head: () =>
    pageHead({
      title: "Building Culture — Telegram",
      description:
        "Learn, connect your TON wallet, complete quests, and grow the Building Culture community.",
      path: "/tg",
      noIndex: false,
    }),
  component: TelegramMiniAppPage,
});

function TelegramMiniAppPage() {
  return <TelegramMiniApp />;
}
