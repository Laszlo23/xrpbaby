// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice ERC-7943-aligned uRWA surface for permissioned property share tokens.
interface IuRWA {
  function canSend(address account) external view returns (bool);

  function canReceive(address account) external view returns (bool);

  function canTransfer(address from, address to, uint256 amount) external view returns (bool);

  function isFrozen(address account) external view returns (bool);

  /// @notice Legal / compliance enforcement transfer (admin-only in implementations).
  function forcedTransfer(address from, address to, uint256 amount) external;
}
