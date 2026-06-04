/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_RPC_URL?: string;
  readonly VITE_BSC_HTTP_URL?: string;
  readonly VITE_BSC_WSS_URL?: string;
  readonly VITE_4EVERLAND_BSC_API_KEY?: string;
  readonly VITE_PRIVY_APP_ID?: string;
  readonly VITE_PRIVY_CLIENT_ID?: string;
  readonly VITE_PLATFORM_ORIGIN?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_WALLET_CONNECT_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
