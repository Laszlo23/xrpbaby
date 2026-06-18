/** BccFeeRouter — treasury / burn / ecosystem split for protocol fees. */
export function getBccFeeRouterAddress(): `0x${string}` | "" {
  const v =
    import.meta.env.VITE_BCC_FEE_ROUTER?.trim() ??
    (typeof process !== "undefined" ? process.env.VITE_BCC_FEE_ROUTER?.trim() : "") ??
    "";
  if (v.length === 42 && v.startsWith("0x")) return v as `0x${string}`;
  return "";
}

export const BCC_FEE_ROUTER_ABI = [
  {
    name: "route",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "treasuryBps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "burnBps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "ecosystemBps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
