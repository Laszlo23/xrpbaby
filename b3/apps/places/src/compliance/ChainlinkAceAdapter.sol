// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IComplianceBackend} from "../interfaces/IComplianceBackend.sol";
import {IComplianceRegistry} from "../interfaces/IComplianceRegistry.sol";

/// @notice Chainlink ACE compliance module surface (set via ChainlinkAceAdapter.setAceModule).
interface IAceComplianceModule {
  function canSend(address account) external view returns (bool);

  function canReceive(address account) external view returns (bool);

  function canTransfer(address from, address to, uint256 amount) external view returns (bool);
}

/// @notice Chainlink ACE integration point. When `aceModule` is set, delegates to ACE; else falls back to registry.
contract ChainlinkAceAdapter is AccessControl, IComplianceBackend {
  IComplianceRegistry public immutable REGISTRY;
  IAceComplianceModule public aceModule;

  event AceModuleUpdated(address indexed previousModule, address indexed newModule);

  constructor(IComplianceRegistry registry_, address admin_) {
    REGISTRY = registry_;
    _grantRole(DEFAULT_ADMIN_ROLE, admin_);
  }

  function setAceModule(address module) external onlyRole(DEFAULT_ADMIN_ROLE) {
    emit AceModuleUpdated(address(aceModule), module);
    aceModule = IAceComplianceModule(module);
  }

  function canSend(address account) external view returns (bool) {
    if (address(aceModule) != address(0)) {
      return aceModule.canSend(account);
    }
    return REGISTRY.isVerified(account) || REGISTRY.isSystemContract(account);
  }

  function canReceive(address account) external view returns (bool) {
    if (address(aceModule) != address(0)) {
      return aceModule.canReceive(account);
    }
    return REGISTRY.isVerified(account) || REGISTRY.isSystemContract(account);
  }

  function canTransfer(address from, address to, uint256 amount) external view returns (bool) {
    if (address(aceModule) != address(0)) {
      return aceModule.canTransfer(from, to, amount);
    }
    return _registryCanHold(from) && _registryCanHold(to);
  }

  function _registryCanHold(address a) internal view returns (bool) {
    return REGISTRY.isVerified(a) || REGISTRY.isSystemContract(a);
  }
}
