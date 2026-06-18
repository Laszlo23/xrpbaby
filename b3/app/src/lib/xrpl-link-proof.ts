import { convertStringToHex } from "xrpl";

export const XRPL_LINK_MEMO_TYPE = "bc/xrpl-link";

export function buildXrplLinkProofTransaction(address: string, nonce: string) {
  return {
    TransactionType: "Payment" as const,
    Account: address,
    Destination: address,
    Amount: "1",
    Memos: [
      {
        Memo: {
          MemoType: convertStringToHex(XRPL_LINK_MEMO_TYPE),
          MemoData: convertStringToHex(nonce),
        },
      },
    ],
  };
}
