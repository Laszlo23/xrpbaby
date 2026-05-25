import { createPublicClient, http } from "viem";
import { appChain, rpcUrl } from "./config";

export const publicClient = createPublicClient({
  chain: appChain,
  transport: http(rpcUrl),
});
