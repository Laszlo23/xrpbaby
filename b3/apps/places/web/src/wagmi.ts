import { createConfig as createPrivyWagmiConfig } from "@privy-io/wagmi";
import { createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { http } from "wagmi";
import { base } from "viem/chains";
import { legacyTestnetEnabled, ogGalileo } from "./lib/chain";

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const baseRpc =
  process.env.NEXT_PUBLIC_BASE_RPC?.trim() || "https://mainnet.base.org";

const ogRpc =
  process.env.NEXT_PUBLIC_OG_RPC?.trim() || ogGalileo.rpcUrls.default.http[0];

const vanillaConnectors = [
  injected(),
  ...(wcProjectId
    ? [
        walletConnect({
          projectId: wcProjectId,
          showQrModal: true,
        }),
      ]
    : []),
];

const vanillaShared = { connectors: vanillaConnectors, ssr: true as const };

/**
 * Wagmi config for use **without** Privy (`PrivyProvider` omitted). Uses standard
 * `injected` + optional `walletConnect` and EIP-6963 discovery.
 */
export const wagmiConfigVanilla = legacyTestnetEnabled
  ? createConfig({
      ...vanillaShared,
      chains: [base, ogGalileo],
      transports: {
        [base.id]: http(baseRpc),
        [ogGalileo.id]: http(ogRpc),
      },
    })
  : createConfig({
      ...vanillaShared,
      chains: [base],
      transports: {
        [base.id]: http(baseRpc),
      },
    });

/**
 * Wagmi config for `@privy-io/wagmi` + `PrivyProvider`.
 *
 * `@privy-io/wagmi`'s `createConfig` intentionally strips manual `injected` /
 * `walletConnect` entries and disables multi-injected discovery — connectors are
 * registered at runtime via Privy (`useSyncPrivyWallets`). Pass **only** chains +
 * transports here.
 *
 * @see https://docs.privy.io/wallets/connectors/ethereum/integrations/wagmi
 */
export const wagmiConfigPrivy = legacyTestnetEnabled
  ? createPrivyWagmiConfig({
      chains: [base, ogGalileo],
      transports: {
        [base.id]: http(baseRpc),
        [ogGalileo.id]: http(ogRpc),
      },
    })
  : createPrivyWagmiConfig({
      chains: [base],
      transports: {
        [base.id]: http(baseRpc),
      },
    });
