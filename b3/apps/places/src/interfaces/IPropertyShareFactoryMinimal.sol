// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal surface for proof NFT to resolve share token per property.
interface IPropertyShareFactoryMinimal {
    function tokenByPropertyId(uint256 propertyId) external view returns (address);
}
