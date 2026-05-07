/* eslint-disable -- generated from forge out/BCDFixedPriceSale.sol/BCDFixedPriceSale.json */
export const bcdFixedPriceSaleAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "initialOwner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "token_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "treasury_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "paymentToken_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "buy",
    "inputs": [
      {
        "name": "roundId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "bcdAmountWei",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "merkleMaxBcdWei",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "proof",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "configureRound",
    "inputs": [
      {
        "name": "roundId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "r",
        "type": "tuple",
        "internalType": "struct BCDFixedPriceSale.Round",
        "components": [
          {
            "name": "start",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "end",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "merkleRoot",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "paymentPerWholeBcd",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "maxBcdWei",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "perWalletPublicCapWei",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "feeBps",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "paymentToken",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rescueERC20",
    "inputs": [
      {
        "name": "a",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rescueETH",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "roundSoldBcdWei",
    "inputs": [
      {
        "name": "roundId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "soldBcdWei",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "rounds",
    "inputs": [
      {
        "name": "roundId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "start",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "end",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "merkleRoot",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "paymentPerWholeBcd",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maxBcdWei",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "perWalletPublicCapWei",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setFeeBps",
    "inputs": [
      {
        "name": "bps",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "token",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IBCDSaleMintable"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "treasury",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "walletBoughtBcdWei",
    "inputs": [
      {
        "name": "roundId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "buyer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "boughtBcdWei",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "FeeBpsUpdated",
    "inputs": [
      {
        "name": "feeBps",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Paused",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Purchased",
    "inputs": [
      {
        "name": "roundId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "buyer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "bcdWei",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "paymentToTreasury",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RoundConfigured",
    "inputs": [
      {
        "name": "roundId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "start",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      },
      {
        "name": "end",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      },
      {
        "name": "merkleRoot",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      },
      {
        "name": "paymentPerWholeBcd",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "maxBcdWei",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unpaused",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AddressEmptyCode",
    "inputs": [
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "AddressInsufficientBalance",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "EnforcedPause",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ExpectedPause",
    "inputs": []
  },
  {
    "type": "error",
    "name": "FailedInnerCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MathOverflowedMulDiv",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      }
    ]
  }
] as const;
