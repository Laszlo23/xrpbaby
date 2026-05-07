import { SiweMessage } from "siwe";

export async function verifySiweSignature(message: string, signature: string): Promise<string> {
  const siwe = new SiweMessage(message);
  const result = await siwe.verify({ signature });
  if (!result.success || !result.data.address) {
    throw new Error(result.error?.type ?? "SIWE verification failed");
  }
  return result.data.address;
}
