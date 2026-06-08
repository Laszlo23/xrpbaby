import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { syncMemberWallet, syncMemberSocialScore } from "./member-sync.js";

export type CultureMemberSyncProps = {
  /** Central API origin — defaults to https://app.buildingcultureid.space */
  syncApiOrigin?: string;
};

/** Links Privy user + embedded wallet to Postgres Member on login. */
export function CultureMemberSync({ syncApiOrigin }: CultureMemberSyncProps) {
  const { authenticated, user, getAccessToken } = usePrivy();
  const { address } = useAccount();
  const lastSync = useRef<string | null>(null);

  useEffect(() => {
    if (!authenticated || !user?.id || !address) return;
    const key = `${user.id}:${address.toLowerCase()}`;
    if (lastSync.current === key) return;
    lastSync.current = key;

    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          lastSync.current = null;
          return;
        }
        await syncMemberWallet({
          walletAddress: address,
          accessToken: token,
          syncApiOrigin,
        });
        await syncMemberSocialScore({
          walletAddress: address,
          accessToken: token,
          syncApiOrigin,
        }).catch(() => {});
      } catch {
        lastSync.current = null;
      }
    })();
  }, [authenticated, user?.id, address, getAccessToken, syncApiOrigin]);

  return null;
}
