import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

const RPC_URL = process.env.VITE_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const ENV_PATH = resolve(process.cwd(), ".env");
const KEYPAIR_PATH = resolve(process.cwd(), "treasury-keypair.json");

async function airdropIfNeeded(connection: Connection, pubkey: Keypair["publicKey"]) {
  const balance = await connection.getBalance(pubkey);
  if (balance >= 0.5 * LAMPORTS_PER_SOL) return;

  console.log("Requesting devnet airdrop...");
  try {
    const sig = await connection.requestAirdrop(pubkey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
    console.log("Airdrop confirmed:", sig);
  } catch (error) {
    console.warn("Devnet airdrop failed (faucet may be rate-limited).");
    console.warn("Fund the treasury manually: https://faucet.solana.com");
    const after = await connection.getBalance(pubkey);
    if (after < 0.1 * LAMPORTS_PER_SOL) {
      throw error;
    }
  }
}

function loadOrCreateTreasury(): Keypair {
  if (existsSync(KEYPAIR_PATH)) {
    const raw = JSON.parse(readFileSync(KEYPAIR_PATH, "utf8")) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(raw));
  }
  const kp = Keypair.generate();
  writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(kp.secretKey)));
  return kp;
}

function updateEnv(mint: string, secretKey: string) {
  let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  const set = (key: string, value: string) => {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    env = re.test(env) ? env.replace(re, line) : `${env.trim()}\n${line}\n`;
  };
  set("VITE_SOLANA_NETWORK", "devnet");
  set("VITE_SOLANA_RPC_URL", RPC_URL);
  set("VITE_BCC_MINT", mint);
  set("TREASURY_SECRET_KEY", secretKey);
  if (!env.includes("DATABASE_URL")) {
    set("DATABASE_URL", '"file:./dev.db"');
  }
  writeFileSync(ENV_PATH, env.endsWith("\n") ? env : `${env}\n`);
}

async function main() {
  const treasury = loadOrCreateTreasury();
  const connection = new Connection(RPC_URL, "confirmed");

  console.log("Treasury:", treasury.publicKey.toBase58());
  await airdropIfNeeded(connection, treasury.publicKey);

  const mint = await createMint(connection, treasury, treasury.publicKey, treasury.publicKey, 6);

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    treasury,
    mint,
    treasury.publicKey,
  );

  await mintTo(connection, treasury, mint, ata.address, treasury, 1_000_000 * 1_000_000);

  const secretKey = bs58.encode(treasury.secretKey);
  updateEnv(mint.toBase58(), secretKey);

  console.log("\nDevnet setup complete!");
  console.log("BCC Mint:", mint.toBase58());
  console.log("Treasury ATA:", ata.address.toBase58());
  console.log("Updated .env with VITE_BCC_MINT and TREASURY_SECRET_KEY");
  console.log("\nNext steps:");
  console.log("  bun run db:seed");
  console.log("  bun dev");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
