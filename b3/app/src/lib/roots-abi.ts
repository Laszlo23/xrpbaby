export const BCC_ROOTS_STAKING_ABI = [
  {
    type: "function",
    name: "stake",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getReward",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getRewardAll",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestUnstake",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "completeUnstake",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "earned",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stakeUnlockAt",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingWithdraw",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "unstakeUnlockAt",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalStaked",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: [
      { name: "raw", type: "uint256" },
      { name: "weighted", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolConfig",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "lockDuration", type: "uint256" },
      { name: "weightBps", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "stakingToken",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;
