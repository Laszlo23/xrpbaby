import { convertStringToHex, decode, verifyKeypairSignature, verifySignature } from "xrpl";

import { XRPL_LINK_MEMO_TYPE, buildXrplLinkProofTransaction } from "@/lib/xrpl-link-proof";

export { buildXrplLinkProofTransaction };

function memoNonceFromTx(tx: Record<string, unknown>): string | null {
  const memos = tx.Memos;
  if (!Array.isArray(memos)) return null;
  for (const entry of memos) {
    if (!entry || typeof entry !== "object") continue;
    const memo = (entry as { Memo?: { MemoType?: string; MemoData?: string } }).Memo;
    if (!memo?.MemoData) continue;
    try {
      const type = memo.MemoType ? Buffer.from(memo.MemoType, "hex").toString("utf8") : "";
      if (type && type !== XRPL_LINK_MEMO_TYPE) continue;
      return Buffer.from(memo.MemoData, "hex").toString("utf8");
    } catch {
      continue;
    }
  }
  return null;
}

export function verifyXrplMessageSignature(input: {
  message: string;
  signature: string;
  publicKey: string;
}): boolean {
  try {
    const messageHex = convertStringToHex(input.message).toUpperCase();
    return verifyKeypairSignature(
      messageHex,
      input.signature.trim().toUpperCase(),
      input.publicKey.trim().toUpperCase(),
    );
  } catch {
    return false;
  }
}

export function verifyXrplLinkTxBlob(input: {
  txBlob: string;
  xrplAddress: string;
  nonce: string;
}): boolean {
  try {
    const tx = decode(input.txBlob) as Record<string, unknown>;
    if (typeof tx.Account !== "string" || tx.Account !== input.xrplAddress) {
      return false;
    }
    const memoNonce = memoNonceFromTx(tx);
    if (memoNonce !== input.nonce) {
      return false;
    }
    return verifySignature(input.txBlob);
  } catch {
    return false;
  }
}
