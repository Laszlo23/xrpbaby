import { NeynarAuthButton, NeynarContextProvider } from "@neynar/react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { linkMemberFarcaster } from "./member-sync.js";
import { readPlatformOrigin, resolveCultureAuthEnv } from "./env.js";

export type ConnectFarcasterButtonProps = {
  className?: string;
  syncApiOrigin?: string;
  onLinked?: (supportScore?: number) => void;
  label?: string;
};

/** Links Farcaster to the unified Member via Neynar SIWN + hub API. */
export function ConnectFarcasterButton({
  className = "",
  syncApiOrigin,
  onLinked,
  label = "Connect Farcaster",
}: ConnectFarcasterButtonProps) {
  const { authenticated, getAccessToken, user } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const walletAddress = wagmiAddress ?? user?.wallet?.address;
  const origin = syncApiOrigin ?? readPlatformOrigin();
  const neynarClientId = resolveCultureAuthEnv().neynarClientId;

  if (!neynarClientId) {
    return (
      <p className={`text-xs text-zinc-500 ${className}`}>
        Farcaster login unavailable (NEYNAR_CLIENT_ID not set).
      </p>
    );
  }

  if (!authenticated || !walletAddress) {
    return (
      <p className={`text-xs text-zinc-500 ${className}`}>Connect your wallet first.</p>
    );
  }

  return (
    <NeynarContextProvider
      settings={{
        clientId: neynarClientId,
        eventsCallbacks: {
          onAuthSuccess: async ({ user }) => {
            const token = await getAccessToken();
            if (!token) return;
            const result = await linkMemberFarcaster({
              walletAddress: walletAddress,
              fid: user.fid,
              signerUuid: user.signer_uuid,
              accessToken: token,
              syncApiOrigin: origin,
            });
            if (result.ok) onLinked?.(result.supportScore);
          },
        },
      }}
    >
      <div className={className}>
        <NeynarAuthButton label={label} />
      </div>
    </NeynarContextProvider>
  );
}
