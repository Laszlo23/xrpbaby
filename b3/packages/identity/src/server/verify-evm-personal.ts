import { verifyMessage, type Address, type Hex } from "viem";

/** `personal_sign` / EIP-191 verification (Strapi community wallet flow, etc.). */
export async function verifyEvmWalletSignature(args: {
  address: Address;
  message: string;
  signature: Hex;
}): Promise<boolean> {
  return verifyMessage({
    address: args.address,
    message: args.message,
    signature: args.signature,
  });
}
