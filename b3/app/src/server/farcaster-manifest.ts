/**
 * /.well-known/farcaster.json manifest — Mini App publishing metadata.
 * @see https://miniapps.farcaster.xyz/docs/guides/publishing
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getServerPublicOrigin } from "@/lib/app-origin";

export type FarcasterAccountAssociation = {
  header: string;
  payload: string;
  signature: string;
};

const PLACEHOLDER = "REPLACE_VIA_WARPCAST";

function defaultAssociationPath(): string {
  return resolve(process.cwd(), "data/farcaster-account-association.json");
}

function isSignedValue(value: string | undefined): value is string {
  if (!value?.trim()) return false;
  const v = value.trim();
  return v !== PLACEHOLDER && !v.startsWith("PASTE_");
}

/** Signed domain proof from Warpcast → Settings → Developer → Domains. */
export function readFarcasterAccountAssociation(): FarcasterAccountAssociation | undefined {
  const header = process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER?.trim();
  const payload = process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD?.trim();
  const signature = process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE?.trim();

  if (isSignedValue(header) && isSignedValue(payload) && isSignedValue(signature)) {
    return { header, payload, signature };
  }

  const filePath =
    process.env.FARCASTER_ACCOUNT_ASSOCIATION_FILE?.trim() || defaultAssociationPath();
  if (!existsSync(filePath)) return undefined;

  try {
    const raw = JSON.parse(readFileSync(filePath, "utf8")) as Partial<FarcasterAccountAssociation>;
    if (isSignedValue(raw.header) && isSignedValue(raw.payload) && isSignedValue(raw.signature)) {
      return {
        header: raw.header.trim(),
        payload: raw.payload.trim(),
        signature: raw.signature.trim(),
      };
    }
  } catch {
    /* fall through */
  }

  return undefined;
}

export function buildFarcasterManifest(options?: {
  includeUnsignedAssociation?: boolean;
}): Record<string, unknown> {
  const origin = getServerPublicOrigin();
  const host = new URL(origin).host;
  const homeUrl = `${origin}/`;
  const defaultIcon = `${origin}/brand/miniapp-icon.svg`;
  const defaultOg = `${origin}/meta/home-meta-og.png`;
  const iconUrl = process.env.FARCASTER_ICON_URL?.trim() || defaultIcon;
  const ogImage = process.env.FARCASTER_OG_IMAGE_URL?.trim() || defaultOg;

  const manifest: Record<string, unknown> = {
    miniapp: {
      version: "1",
      name: process.env.FARCASTER_APP_NAME?.trim() || "Building Culture",
      iconUrl,
      homeUrl,
      splashImageUrl: iconUrl,
      splashBackgroundColor: "#0c0d12",
      subtitle: process.env.FARCASTER_APP_SUBTITLE?.trim() || "Culture ID on Base",
      description:
        process.env.FARCASTER_APP_DESCRIPTION?.trim() ||
        "Mint your .culture name, earn points, and explore the Building Culture ecosystem on Base.",
      heroImageUrl: ogImage,
      tagline: process.env.FARCASTER_APP_TAGLINE?.trim() || "Your name on-chain",
      ogTitle: process.env.FARCASTER_APP_NAME?.trim() || "Building Culture",
      ogDescription:
        process.env.FARCASTER_APP_OG_DESCRIPTION?.trim() ||
        "Claim your Culture Layer identity on Base — invite USHINE77, from $0.07.",
      ogImageUrl: ogImage,
      primaryCategory: "social",
      tags: ["base", "culture", "identity", "builder", "rwa"],
      requiredChains: ["eip155:8453"],
      canonicalDomain: process.env.FARCASTER_CANONICAL_DOMAIN?.trim() || host,
    },
  };

  const association = readFarcasterAccountAssociation();
  if (association) {
    manifest.accountAssociation = association;
  } else if (options?.includeUnsignedAssociation) {
    manifest.accountAssociation = {
      header: PLACEHOLDER,
      payload: PLACEHOLDER,
      signature: PLACEHOLDER,
    };
  }

  return manifest;
}
