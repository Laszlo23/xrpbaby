import { useEffect } from "react";
import {
  getTelegramWebApp,
  initTelegramWebAppChrome,
  loadTelegramWebAppScript,
} from "@/lib/tg/telegram-webapp";

/** Loads Telegram WebApp SDK and signals the host that the UI is ready. */
export function TelegramMiniAppReady() {
  useEffect(() => {
    let cancelled = false;
    void loadTelegramWebAppScript()
      .then(() => {
        if (cancelled) return;
        initTelegramWebAppChrome();
        const wa = getTelegramWebApp();
        if (wa?.colorScheme === "dark") {
          document.documentElement.classList.add("dark");
        }
      })
      .catch(() => {
        /* opened outside Telegram — dev fallback still works */
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
