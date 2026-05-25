// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {IComplianceRegistry} from "./interfaces/IComplianceRegistry.sol";
import {IPropertyShareToken} from "./interfaces/IPropertyShareToken.sol";
import {IuRWA} from "./interfaces/IuRWA.sol";

/// @title RestrictedPropertyShareToken
/// @notice REOC v1 L2 + L4 profile B/D — property share with compliance-gated transfers and uRWA surface.
contract RestrictedPropertyShareToken is IPropertyShareToken, IuRWA, ERC20, ERC20Permit, AccessControl {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant COMPLIANCE_ADMIN_ROLE = keccak256("COMPLIANCE_ADMIN_ROLE");

  IComplianceRegistry public immutable COMPLIANCE;
  uint256 private immutable _propertyId;
  address private immutable _registry;
  uint256 private immutable _supplyCap;
  string private _metadataURI;

  mapping(address => bool) private _frozen;
  bool private _enforcingTransfer;

  error CapExceeded();
  error ZeroAddress();
  error NotCompliant();
  error AccountFrozen();

  constructor(
    string memory name_,
    string memory symbol_,
    uint256 propertyId_,
    address registry_,
    string memory metadataURI_,
    uint256 supplyCap_,
    address admin_,
    uint256 initialSupply,
    address initialReceiver,
    IComplianceRegistry compliance_
  ) ERC20(name_, symbol_) ERC20Permit(name_) {
    if (registry_ == address(0) || admin_ == address(0) || address(compliance_) == address(0)) {
      revert ZeroAddress();
    }
    COMPLIANCE = compliance_;
    _propertyId = propertyId_;
    _registry = registry_;
    _supplyCap = supplyCap_;
    _metadataURI = metadataURI_;
    _grantRole(DEFAULT_ADMIN_ROLE, admin_);
    _grantRole(MINTER_ROLE, admin_);
    _grantRole(COMPLIANCE_ADMIN_ROLE, admin_);

    address recv = initialReceiver == address(0) ? admin_ : initialReceiver;
    if (initialSupply > 0) {
      if (supplyCap_ != 0 && initialSupply > supplyCap_) revert CapExceeded();
      _mint(recv, initialSupply);
    }

    emit PropertyShareDeployed(propertyId_, address(this), registry_, metadataURI_, supplyCap_);
  }

  function propertyId() external view returns (uint256) {
    return _propertyId;
  }

  function REGISTRY() external view returns (address) {
    return _registry;
  }

  function metadataURI() external view returns (string memory) {
    return _metadataURI;
  }

  function supplyCap() external view returns (uint256) {
    return _supplyCap;
  }

  function setMetadataURI(string calldata newUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _metadataURI = newUri;
  }

  function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
    if (_supplyCap != 0 && totalSupply() + amount > _supplyCap) revert CapExceeded();
    _mint(to, amount);
  }

  function burn(uint256 amount) external {
    _burn(msg.sender, amount);
  }

  function burnFrom(address from, uint256 amount) external {
    _spendAllowance(from, msg.sender, amount);
    _burn(from, amount);
  }

  // --- uRWA (ERC-7943-aligned) ---

  function canSend(address account) public view returns (bool) {
    if (_frozen[account]) return false;
    return COMPLIANCE.isVerified(account) || COMPLIANCE.isSystemContract(account);
  }

  function canReceive(address account) public view returns (bool) {
    if (_frozen[account]) return false;
    return COMPLIANCE.isVerified(account) || COMPLIANCE.isSystemContract(account);
  }

  function canTransfer(address from, address to, uint256) public view returns (bool) {
    return canSend(from) && canReceive(to);
  }

  function isFrozen(address account) external view returns (bool) {
    return _frozen[account];
  }

  function setFrozen(address account, bool frozen) external onlyRole(COMPLIANCE_ADMIN_ROLE) {
    _frozen[account] = frozen;
  }

  function forcedTransfer(address from, address to, uint256 amount) external onlyRole(COMPLIANCE_ADMIN_ROLE) {
    _enforcingTransfer = true;
    _update(from, to, amount);
    _enforcingTransfer = false;
  }

  function _canHold(address a) internal view returns (bool) {
    return canReceive(a) || a == address(0);
  }

  function _update(address from, address to, uint256 value) internal override {
    if (value == 0) {
      super._update(from, to, value);
      return;
    }
    if (from != address(0) && _frozen[from]) revert AccountFrozen();
    if (to != address(0) && _frozen[to]) revert AccountFrozen();

    if (!_enforcingTransfer) {
      if (from == address(0)) {
        if (!_canHold(to)) revert NotCompliant();
      } else if (to == address(0)) {
        if (!canSend(from)) revert NotCompliant();
      } else {
        if (!canTransfer(from, to, value)) revert NotCompliant();
      }
    }
    super._update(from, to, value);
  }
}
