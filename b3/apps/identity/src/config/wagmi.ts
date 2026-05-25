import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { appChain, rpcUrl } from "@/lib/chain/config";

const connectors = [farcasterMiniApp(), injected({ shimDisconnect: true })];

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors,
  transports: {
    [base.id]: http(
      appChain.id === base.id ? rpcUrl : "https://mainnet.base.org",
    ),
    [baseSepolia.id]: http(
      appChain.id === baseSepolia.id ? rpcUrl : "https://sepolia.base.org",
    ),
  },
  ssr: true,
});

export const targetChainId = appChain.id;
