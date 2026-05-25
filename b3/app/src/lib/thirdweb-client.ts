import { createThirdwebClient, type ThirdwebClient } from "thirdweb";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID as string | undefined;

/**
 * Thirdweb dashboard client id. When unset, marketplace and wallet sync that depend on it are disabled.
 */
export const thirdwebClient: ThirdwebClient | null =
  clientId && clientId.trim().length > 0
    ? createThirdwebClient({ clientId: clientId.trim() })
    : null;
