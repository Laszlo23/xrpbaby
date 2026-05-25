// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IPropertyReserveFeed} from "../interfaces/IPropertyReserveFeed.sol";

/// @notice PoR-style mint cap per property. Attestation pipeline updates `maxShares`; minter checks `canMint`.
contract PropertyReserveFeed is AccessControl, IPropertyReserveFeed {
  bytes32 public constant ATTESTOR_ROLE = keccak256("ATTESTOR_ROLE");
  bytes32 public constant RECORDER_ROLE = keccak256("RECORDER_ROLE");

  mapping(uint256 propertyId => uint256 maxShares) private _maxShares;
  mapping(uint256 propertyId => uint256 minted) private _minted;

  event ReserveUpdated(uint256 indexed propertyId, uint256 maxShares, bytes32 attestationHash);
  event MintedRecorded(uint256 indexed propertyId, uint256 amount, uint256 totalMinted);

  error ExceedsReserve();

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(ATTESTOR_ROLE, admin);
    _grantRole(RECORDER_ROLE, admin);
  }

  function setMaxMintableShares(uint256 propertyId, uint256 maxShares, bytes32 attestationHash)
    external
    onlyRole(ATTESTOR_ROLE)
  {
    _maxShares[propertyId] = maxShares;
    emit ReserveUpdated(propertyId, maxShares, attestationHash);
  }

  function recordMint(uint256 propertyId, uint256 amount) external onlyRole(RECORDER_ROLE) {
    _minted[propertyId] += amount;
    emit MintedRecorded(propertyId, amount, _minted[propertyId]);
  }

  function maxMintableShares(uint256 propertyId) external view returns (uint256) {
    return _maxShares[propertyId];
  }

  function totalMintedShares(uint256 propertyId) external view returns (uint256) {
    return _minted[propertyId];
  }

  function canMint(uint256 propertyId, uint256 additionalShares) external view returns (bool) {
    uint256 max = _maxShares[propertyId];
    if (max == 0) return true;
    return _minted[propertyId] + additionalShares <= max;
  }

  function requireCanMint(uint256 propertyId, uint256 additionalShares) external view {
    if (!this.canMint(propertyId, additionalShares)) revert ExceedsReserve();
  }
}
