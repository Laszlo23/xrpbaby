import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

const THEME_BG = "#0c0d12";

async function initNativeChrome(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: THEME_BG });
  } catch {
    // Status bar plugin unavailable on some simulators
  }

  try {
    await SplashScreen.hide();
  } catch {
    // Splash auto-hides via capacitor.config.ts
  }
}

function registerDeepLinks(): void {
  void App.addListener("appUrlOpen", (event) => {
    const url = new URL(event.url);
    if (url.protocol === "buildingculture:" && url.hostname === "auth") {
      const returnPath = url.searchParams.get("returnPath") ?? "/join";
      window.location.href = `https://app.buildingcultureid.space${returnPath}`;
    }
  });
}

void initNativeChrome();
registerDeepLinks();
