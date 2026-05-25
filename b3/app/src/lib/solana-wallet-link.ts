import bs58 from "bs58";

type PhantomLike = {
  isPhantom?: boolean;
  publicKey?: { toBase58: () => string };
  connect?: () => Promise<void>;
  signMessage?: (
    message: Uint8Array,
    display?: string,
  ) => Promise<{ signature: Uint8Array } | Uint8Array>;
};

export async function signSolanaLinkMessage(messageUtf8: string): Promise<{
  address: string;
  signature: string;
  message: string;
}> {
  const provider = (
    typeof window !== "undefined"
      ? (window as unknown as { solana?: PhantomLike }).solana
      : undefined
  ) as PhantomLike | undefined;

  if (!provider?.signMessage) {
    throw new Error("Install Phantom or another Solana wallet that supports signMessage.");
  }

  if (provider.connect) await provider.connect();
  const pk = provider.publicKey?.toBase58();
  if (!pk) throw new Error("Could not read Solana public key.");

  const encoded = new TextEncoder().encode(messageUtf8);
  const signed = await provider.signMessage(encoded);
  const sigBytes = signed instanceof Uint8Array ? signed : signed.signature;
  const signature = bs58.encode(sigBytes);

  return { address: pk, signature, message: messageUtf8 };
}
