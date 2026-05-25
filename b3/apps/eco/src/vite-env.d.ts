/// <reference types="vite/client" />

declare module "*.md?raw" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_ENABLE_WEB3?: string;
  readonly VITE_THIRDWEB_CLIENT_ID?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_EVM_NETWORK?: string;
  readonly VITE_BASE_RPC_URL?: string;
  readonly VITE_ECO_HUB_LANDING_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_LEGAL_ENTITY_NAME?: string;
  readonly VITE_LEGAL_ADDRESS?: string;
  readonly VITE_LEGAL_CONTACT_EMAIL?: string;
  readonly VITE_LEGAL_UID_VAT?: string;
  readonly VITE_LEGAL_REGISTRY_COURT?: string;
  readonly VITE_LEGAL_REGISTRY_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
