/** Canonical social handle — env vars override per platform when needed. */
export const SOCIAL_HANDLE = "buildingcultu3" as const;

export type SocialPlatform = "x" | "instagram" | "linkedin";

const defaults: Record<SocialPlatform, string> = {
  x: `https://x.com/${SOCIAL_HANDLE}`,
  instagram: `https://www.instagram.com/${SOCIAL_HANDLE}/`,
  linkedin: `https://www.linkedin.com/company/${SOCIAL_HANDLE}`,
};

export function getSocialUrl(platform: SocialPlatform): string {
  const env =
    platform === "x"
      ? process.env.NEXT_PUBLIC_SOCIAL_X
      : platform === "instagram"
        ? process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM
        : process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN;
  const url = env?.trim();
  return url && url.length > 0 ? url : defaults[platform];
}
