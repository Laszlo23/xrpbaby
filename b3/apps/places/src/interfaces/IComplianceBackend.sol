// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Pluggable compliance backend (ComplianceRegistry adapter or Chainlink ACE module).
interface IComplianceBackend {
  function canSend(address account) external view returns (bool);

  function canReceive(address account) external view returns (bool);

  function canTransfer(address from, address to, uint256 amount) external view returns (bool);
}
