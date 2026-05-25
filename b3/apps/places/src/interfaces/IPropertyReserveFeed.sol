// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Proof-of-reserve style cap: max mintable share units per property.
interface IPropertyReserveFeed {
  function maxMintableShares(uint256 propertyId) external view returns (uint256);

  function totalMintedShares(uint256 propertyId) external view returns (uint256);

  function canMint(uint256 propertyId, uint256 additionalShares) external view returns (bool);

  function recordMint(uint256 propertyId, uint256 amount) external;
}
