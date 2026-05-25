// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {IPropertyShareToken} from "./interfaces/IPropertyShareToken.sol";

/// @title PropertyShareToken
/// @notice REOC v1 L2 — ERC-20 property shares; optional supply cap; MINTER_ROLE for issuance (L4 profile A: unrestricted transfers).
/// @dev See `docs/standards/reoc-v1.md` §3–§5.
contract PropertyShareToken is IPropertyShareToken, ERC20, ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private immutable _propertyId;
    address private immutable _registry;
    uint256 private immutable _supplyCap;
    string private _metadataURI;

    error CapExceeded();
    error ZeroAddress();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 propertyId_,
        address registry_,
        string memory metadataURI_,
        uint256 supplyCap_,
        address admin_,
        uint256 initialSupply,
        address initialReceiver
    ) ERC20(name_, symbol_) ERC20Permit(name_) {
        if (registry_ == address(0) || admin_ == address(0)) revert ZeroAddress();
        _propertyId = propertyId_;
        _registry = registry_;
        _supplyCap = supplyCap_;
        _metadataURI = metadataURI_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, admin_);

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
}
