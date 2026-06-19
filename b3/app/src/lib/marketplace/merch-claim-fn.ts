import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const claimCodeSchema = z.object({
  code: z.string().min(8).max(128),
});

export type MerchClaimPreview = {
  claimCode: string;
  dropSlug: string;
  dropTitle: string;
  imageUrl: string;
  unitNumber: number;
  editionCap: number;
  size: string;
  status: string;
  claimed: boolean;
  paid: boolean;
  x402TxHash?: string | null;
  paymentRail?: string | null;
  wallet: string;
  hasCultureIdentity?: boolean;
  cultureIdHandle?: string | null;
};

export type MerchClaimPreviewResult = {
  preview: MerchClaimPreview | null;
  cultureIdHandle: string | null;
};

/** Server-only: merch claim page preview by QR code. */
export const fetchMerchClaimPreviewFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => claimCodeSchema.parse(raw))
  .handler(async ({ data }): Promise<MerchClaimPreviewResult> => {
    const { getMerchClaimPreview } = await import("@/server/marketplace/merch-claim");
    const preview = await getMerchClaimPreview(data.code);
    return {
      preview,
      cultureIdHandle: preview?.cultureIdHandle ?? null,
    };
  });
