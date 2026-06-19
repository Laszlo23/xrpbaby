/* eslint-disable -- generated from forge out/CultureSpinningWell.sol/CultureSpinningWell.json */
export const cultureSpinningWellAbi = [
  {
    "type": "function",
    "name": "lastSpinDay",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
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
    "name": "spin",
    "inputs": [
      {
        "name": "value",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "WellSpun",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "dayIndex",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "value",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "CultureSpinningWell__AlreadySpun",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CultureSpinningWell__InvalidValue",
    "inputs": []
  }
] as const;
