import { getEnsAvatar, getEnsName } from "viem/ens";
import type { Address } from "viem";
import { createPublicClient, http } from "viem";
import { base, mainnet } from "viem/chains";
import { appChain, rpcUrl } from "@/lib/chain/config";
import type { ResolvedName, SocialProviderResult } from "./types";

const baseClient = createPublicClient({
  chain: base,
  transport: http(appChain.id === base.id ? rpcUrl : "https://mainnet.base.org"),
});

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

export async function fetchResolvedName(
  owner: Address,
): Promise<SocialProviderResult<ResolvedName | null>> {
  try {
    const basename = await getEnsName(baseClient, { address: owner });
    if (basename) {
      let avatarUrl: string | undefined;
      try {
        const avatar = await getEnsAvatar(baseClient, { name: basename });
        if (avatar) avatarUrl = avatar;
      } catch {
        /* optional */
      }
      return {
        ok: true,
        data: { name: basename, type: "basename", avatarUrl },
      };
    }

    if (appChain.id === base.id) {
      const ensName = await getEnsName(mainnetClient, { address: owner });
      if (ensName) {
        let avatarUrl: string | undefined;
        try {
          const avatar = await getEnsAvatar(mainnetClient, { name: ensName });
          if (avatar) avatarUrl = avatar;
        } catch {
          /* optional */
        }
        return { ok: true, data: { name: ensName, type: "ens", avatarUrl } };
      }
    }

    return { ok: true, data: null };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Name resolution failed",
    };
  }
}
