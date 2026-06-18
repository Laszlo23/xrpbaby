import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { getSolanaRpcUrlServer, getTreasuryKeypair } from "./config.server";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXXgYm9iv");

export async function submitProofMemo(memoText: string): Promise<string> {
  const treasury = getTreasuryKeypair();
  const connection = new Connection(getSolanaRpcUrlServer(), "confirmed");

  const instruction = new TransactionInstruction({
    keys: [{ pubkey: treasury.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoText, "utf8"),
  });

  const transaction = new Transaction().add(instruction);
  const signature = await sendAndConfirmTransaction(connection, transaction, [treasury], {
    commitment: "confirmed",
  });

  return signature;
}

export function buildProofMemoText(periodKey: string, contentHash: string): string {
  return `RESET:PROOF:${periodKey}:${contentHash.slice(0, 16)}`;
}
