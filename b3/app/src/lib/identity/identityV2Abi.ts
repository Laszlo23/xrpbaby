export const cultureLayerIdentityV2Abi = [
  {
    type: "function",
    name: "mintWithBcc",
    inputs: [
      { name: "handle", type: "string", internalType: "string" },
      { name: "tldId", type: "uint8", internalType: "uint8" },
    ],
    outputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "quoteMintWithBcc",
    inputs: [],
    outputs: [{ name: "bccCost", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAvailable",
    inputs: [
      { name: "handle", type: "string", internalType: "string" },
      { name: "tldId", type: "uint8", internalType: "uint8" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "handle", type: "string", internalType: "string" },
      { name: "tldId", type: "uint8", internalType: "uint8" },
    ],
    outputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "mintPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const erc20ApproveAbi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;
