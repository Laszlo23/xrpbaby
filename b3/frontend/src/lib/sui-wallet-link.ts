import { getWallets } from "@wallet-standard/core";

const SUI_SIGN_PERSONAL_MESSAGE = "sui:signPersonalMessage";

/** Discover a Wallet Standard Sui wallet, connect, and sign a UTF-8 message. */
export async function signSuiLinkMessage(messageUtf8: string): Promise<{
  address: string;
  signature: string;
  message: string;
}> {
  const bytes = new TextEncoder().encode(messageUtf8);
  const { get } = getWallets();

  for (const wallet of get()) {
    const connect = wallet.features["standard:connect"] as
      | { connect?: (input?: unknown) => Promise<{ accounts: readonly { address: string }[] }> }
      | undefined;
    const suiPm = wallet.features[SUI_SIGN_PERSONAL_MESSAGE] as
      | {
          signPersonalMessage?: (input: {
            message: Uint8Array;
            account: { address: string };
          }) => Promise<{ signature: string }>;
        }
      | undefined;

    if (!connect?.connect || !suiPm?.signPersonalMessage) continue;

    const connected = await connect.connect();
    const account = connected.accounts[0];
    if (!account) continue;

    const out = await suiPm.signPersonalMessage({
      message: bytes,
      account,
    });

    return {
      address: account.address,
      signature: out.signature,
      message: messageUtf8,
    };
  }

  throw new Error("No Sui wallet detected. Install Sui Wallet or another Wallet Standard wallet.");
}
