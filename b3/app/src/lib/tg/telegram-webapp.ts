/** Telegram Mini App WebApp bridge (https://core.telegram.org/bots/webapps). */

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramWebApp = {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser; start_param?: string };
  ready: () => void;
  expand: () => void;
  close: () => void;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  MainButton?: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  openTelegramLink?: (url: string) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function isTelegramWebApp(): boolean {
  if (readTelegramInitDataRaw()) return true;
  const wa = getTelegramWebApp();
  return Boolean(wa);
}

const TG_INIT_DATA_STORAGE_KEY = "bc_tg_init_data_v1";

function readTelegramInitDataFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "").trim();
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const raw = params.get("tgWebAppData")?.trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function cacheTelegramInitData(raw: string): void {
  try {
    sessionStorage.setItem(TG_INIT_DATA_STORAGE_KEY, raw);
  } catch {
    /* private mode / quota */
  }
}

function readCachedTelegramInitData(): string | null {
  try {
    return sessionStorage.getItem(TG_INIT_DATA_STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

/** Raw init-data query string for server validation (WebApp API, URL hash, or session cache). */
export function readTelegramInitDataRaw(): string | null {
  const fromWebApp = getTelegramWebApp()?.initData?.trim();
  if (fromWebApp) {
    cacheTelegramInitData(fromWebApp);
    return fromWebApp;
  }
  const fromHash = readTelegramInitDataFromHash();
  if (fromHash) {
    cacheTelegramInitData(fromHash);
    return fromHash;
  }
  return readCachedTelegramInitData();
}

export function readTelegramStartParam(): string | null {
  const fromUnsafe = getTelegramWebApp()?.initDataUnsafe?.start_param?.trim();
  return fromUnsafe || null;
}

export function telegramAuthHeaders(initDataRaw?: string | null): Record<string, string> {
  const raw = initDataRaw?.trim() || readTelegramInitDataRaw();
  if (raw) {
    return {
      "Content-Type": "application/json",
      Authorization: `tma ${raw}`,
    };
  }
  if (import.meta.env.DEV) {
    const devUser = import.meta.env.VITE_TELEGRAM_DEV_USER_ID?.trim() || "123456789";
    return {
      "Content-Type": "application/json",
      "x-telegram-dev-user": devUser,
    };
  }
  return { "Content-Type": "application/json" };
}

export function initTelegramWebAppChrome(): void {
  const wa = getTelegramWebApp();
  if (!wa) return;
  try {
    wa.ready();
    wa.expand();
  } catch {
    /* host may not support all APIs */
  }
}

const TELEGRAM_WEBAPP_SCRIPT = "https://telegram.org/js/telegram-web-app.js";

/** Load Telegram WebApp JS (idempotent). Resolves even outside Telegram. */
export function loadTelegramWebAppScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Telegram?.WebApp) return Promise.resolve();
  const existing = document.querySelector(`script[src="${TELEGRAM_WEBAPP_SCRIPT}"]`);
  if (existing) {
    return new Promise((resolve) => {
      if (window.Telegram?.WebApp) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      setTimeout(resolve, 100);
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TELEGRAM_WEBAPP_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("telegram_webapp_script_failed"));
    document.head.appendChild(script);
  });
}

/** Wait for Telegram client to expose signed init data (fixes auth-before-SDK race). */
export async function waitForTelegramInitData(opts?: { timeoutMs?: number }): Promise<string | null> {
  try {
    await loadTelegramWebAppScript();
  } catch {
    /* outside Telegram — fall through */
  }
  initTelegramWebAppChrome();

  const timeoutMs = opts?.timeoutMs ?? 4000;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const raw = readTelegramInitDataRaw();
    if (raw) return raw;
    await new Promise((r) => setTimeout(r, 50));
  }
  return readTelegramInitDataRaw();
}

export const TELEGRAM_MINIAPP_BOT_URL = "https://t.me/buildingcultureappbot";
