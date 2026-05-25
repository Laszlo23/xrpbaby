// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal Chainlink VRF v2 coordinator surface (Base mainnet / sepolia).
interface VRFCoordinatorV2Interface {
  function requestRandomWords(
    bytes32 keyHash,
    uint64 subId,
    uint16 minimumRequestConfirmations,
    uint32 callbackGasLimit,
    uint32 numWords
  ) external returns (uint256 requestId);
}

interface VRFConsumerBaseV2 {
  // Implemented by consumer
}
