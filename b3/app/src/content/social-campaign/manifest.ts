import manifest from "./manifest.json";

export type SocialCampaignChannel = "official" | "grove" | "both";

export type SocialCampaignAsset = {
  id: string;
  image: string;
  ogImage: string;
  width?: number;
  height?: number;
  channel: SocialCampaignChannel;
  pillar: string;
  copyVariants: {
    official: string;
    grove: string;
  };
  cta: string;
  tags: string[];
};

export type SocialCampaignManifest = {
  version: number;
  defaultOrigin: string;
  assets: SocialCampaignAsset[];
};

export const SOCIAL_CAMPAIGN_MANIFEST = manifest as SocialCampaignManifest;

export function getSocialCampaignAsset(id: string): SocialCampaignAsset | undefined {
  return SOCIAL_CAMPAIGN_MANIFEST.assets.find((a) => a.id === id);
}

export function resolveCampaignCta(asset: SocialCampaignAsset): string {
  return asset.cta.replace("{origin}", SOCIAL_CAMPAIGN_MANIFEST.defaultOrigin);
}

export function buildCampaignPostText(
  asset: SocialCampaignAsset,
  account: "official" | "grove",
): string {
  const cta = resolveCampaignCta(asset);
  const template = asset.copyVariants[account];
  return template.replace(/\{cta\}/g, cta).trim();
}
