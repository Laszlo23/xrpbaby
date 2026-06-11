import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Remote-URL mode: the native shell loads the live TanStack app.
 * Web deploys ship instantly — no store release per web change.
 */
const config: CapacitorConfig = {
  appId: "space.buildingcultureid.app",
  appName: "Building Culture",
  webDir: "www",
  server: {
    url: "https://app.buildingcultureid.space",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#0c0d12",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0c0d12",
    },
  },
  ios: {
    contentInset: "automatic",
    scheme: "Building Culture",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
