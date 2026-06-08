import type { UIWallet } from "@tonconnect/ui-react";
import { TELEGRAM_MINIAPP_BOT_URL } from "@/lib/tg/telegram-webapp";

/** TON Connect manifest — must be HTTPS and match the Mini App origin. */
export function getTonConnectManifestUrl(): string {
  const fromEnv = import.meta.env.VITE_TONCONNECT_MANIFEST_URL?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/tonconnect-manifest.json`;
  }
  return "https://app.buildingcultureid.space/tonconnect-manifest.json";
}

/**
 * Return URL after wallet connect inside Telegram Mini App.
 * @see https://github.com/ton-connect/sdk/tree/main/packages/ui#use-inside-tma-telegram-mini-apps
 */
export function getTonConnectTwaReturnUrl(): `https://${string}` {
  const fromEnv = import.meta.env.VITE_TELEGRAM_TWA_RETURN_URL?.trim();
  if (fromEnv && /^https:\/\/.+/.test(fromEnv)) {
    return fromEnv as `https://${string}`;
  }
  return TELEGRAM_MINIAPP_BOT_URL as `https://${string}`;
}

/** Wallets shown when the default TonConnect list is empty inside Telegram. */
const TELEGRAM_WALLET: UIWallet = {
  appName: "telegram-wallet",
  name: "Wallet in Telegram",
  imageUrl: "https://wallet.tg/images/logo-288.png",
  aboutUrl: "https://wallet.tg/",
  universalLink: "https://wallet.tg/ton-connect",
  bridgeUrl: "https://walletbot.me/tonconnect-bridge/bridge",
  platforms: ["ios", "android", "macos", "windows", "linux"],
};

const TONKEEPER_WALLET: UIWallet = {
  appName: "tonkeeper",
  name: "Tonkeeper",
  imageUrl: "https://tonkeeper.com/assets/tonconnect-icon.png",
  aboutUrl: "https://tonkeeper.com",
  universalLink: "https://app.tonkeeper.com/ton-connect",
  bridgeUrl: "https://bridge.tonapi.io/bridge",
  platforms: ["ios", "android", "chrome", "firefox", "safari"],
};

export function getTonConnectWalletsListConfiguration() {
  return { includeWallets: [TELEGRAM_WALLET, TONKEEPER_WALLET] };
}

export function getTonConnectActionsConfiguration() {
  return {
    twaReturnUrl: getTonConnectTwaReturnUrl(),
    returnStrategy: "back" as const,
  };
}
