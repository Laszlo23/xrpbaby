// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IComplianceBackend} from "../interfaces/IComplianceBackend.sol";
import {IComplianceRegistry} from "../interfaces/IComplianceRegistry.sol";

/// @notice Wraps existing ComplianceRegistry as IComplianceBackend (REOC profile B fallback).
contract ComplianceRegistryAdapter is IComplianceBackend {
  IComplianceRegistry public immutable REGISTRY;

  constructor(IComplianceRegistry registry_) {
    REGISTRY = registry_;
  }

  function canSend(address account) external view returns (bool) {
    return REGISTRY.isVerified(account) || REGISTRY.isSystemContract(account);
  }

  function canReceive(address account) external view returns (bool) {
    return REGISTRY.isVerified(account) || REGISTRY.isSystemContract(account);
  }

  function canTransfer(address from, address to, uint256) external view returns (bool) {
    return _canHold(from) && _canHold(to);
  }

  function _canHold(address a) internal view returns (bool) {
    return REGISTRY.isVerified(a) || REGISTRY.isSystemContract(a);
  }
}
