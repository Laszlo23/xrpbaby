import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

import {
  getBccMintAddressServer,
  getSolanaRpcUrlServer,
  getTreasuryKeypair,
} from "./config.server";

const BCC_DECIMALS = 6;

export async function transferBcc(toWallet: string, amount: number): Promise<string> {
  const mintAddress = getBccMintAddressServer();
  if (!mintAddress) {
    throw new Error("VITE_BCC_MINT is not configured. Run: bun run setup:devnet");
  }

  const treasury = getTreasuryKeypair();
  const connection = new Connection(getSolanaRpcUrlServer(), "confirmed");
  const mint = new PublicKey(mintAddress);
  const recipient = new PublicKey(toWallet);

  const treasuryAta = getAssociatedTokenAddressSync(mint, treasury.publicKey);
  const recipientAta = getAssociatedTokenAddressSync(mint, recipient);

  const instructions = [];

  try {
    await getAccount(connection, recipientAta);
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError) {
      instructions.push(
        createAssociatedTokenAccountInstruction(treasury.publicKey, recipientAta, recipient, mint),
      );
    } else {
      throw e;
    }
  }

  const rawAmount = BigInt(amount) * BigInt(10 ** BCC_DECIMALS);
  instructions.push(
    createTransferInstruction(treasuryAta, recipientAta, treasury.publicKey, rawAmount),
  );

  const tx = new Transaction().add(...instructions);
  const signature = await sendAndConfirmTransaction(connection, tx, [treasury], {
    commitment: "confirmed",
  });

  return signature;
}

export async function getBccBalance(walletAddress: string): Promise<number> {
  const mintAddress = getBccMintAddressServer();
  if (!mintAddress) return 0;

  const connection = new Connection(getSolanaRpcUrlServer(), "confirmed");
  const mint = new PublicKey(mintAddress);
  const owner = new PublicKey(walletAddress);
  const ata = getAssociatedTokenAddressSync(mint, owner);

  try {
    const account = await getAccount(connection, ata);
    return Number(account.amount) / 10 ** BCC_DECIMALS;
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError) return 0;
    throw e;
  }
}
