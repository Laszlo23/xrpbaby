import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, create } from "@metaplex-foundation/mpl-core";
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";

import { getSolanaRpcUrlServer, getTreasuryKeypair } from "./config.server";

export type AchievementNftMetadata = {
  title: string;
  achievementKey: string;
  missionSlug: string;
  walletAddress: string;
};

export async function mintAchievementNft(
  toWallet: string,
  metadata: AchievementNftMetadata,
): Promise<string> {
  const treasury = getTreasuryKeypair();
  const umi = createUmi(getSolanaRpcUrlServer()).use(mplCore());
  const umiKeypair = fromWeb3JsKeypair(treasury);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(keypairIdentity(signer));

  const asset = generateSigner(umi);
  const uri = `data:application/json,${encodeURIComponent(
    JSON.stringify({
      name: metadata.title,
      description: `Building Culture Academy achievement: ${metadata.achievementKey}`,
      image: "",
      attributes: [
        { trait_type: "achievement", value: metadata.achievementKey },
        { trait_type: "mission", value: metadata.missionSlug },
        { trait_type: "builder", value: metadata.walletAddress },
      ],
    }),
  )}`;

  await create(umi, {
    asset,
    name: metadata.title,
    uri,
    owner: publicKey(toWallet),
  }).sendAndConfirm(umi);

  return asset.publicKey.toString();
}
