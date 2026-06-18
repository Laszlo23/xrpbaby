import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const walletSchema = z.string().min(32).max(64);

export const getProofStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { handleGetProofStatus } = await import("./proof.handlers.server");
  return handleGetProofStatus();
});

export const requestLinkWalletNonce = createServerFn({ method: "POST" }).handler(async () => {
  const { handleRequestLinkWalletNonce } = await import("./proof.handlers.server");
  return handleRequestLinkWalletNonce();
});

export const linkMemberWallet = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      walletAddress: walletSchema,
      nonce: z.string().uuid(),
      signature: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { handleLinkMemberWallet } = await import("./proof.handlers.server");
    return handleLinkMemberWallet(data.walletAddress, data.nonce, data.signature);
  });

export const requestProofAnchorNonce = createServerFn({ method: "POST" })
  .inputValidator(z.object({ snapshotId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { handleRequestProofAnchorNonce } = await import("./proof.handlers.server");
    return handleRequestProofAnchorNonce(data.snapshotId);
  });

export const anchorProof = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      snapshotId: z.string().min(1),
      signature: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { handleAnchorProof } = await import("./proof.handlers.server");
    return handleAnchorProof(data.snapshotId, data.signature);
  });
