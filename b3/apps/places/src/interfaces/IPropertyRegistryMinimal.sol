// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal registry surface for PropertyShareFactory.
interface IPropertyRegistryMinimal {
    struct Property {
        bytes32 externalRefHash;
        address recordOwner;
        bytes32 metadataHash;
        bool exists;
    }

    function propertyExists(uint256 propertyId) external view returns (bool);

    function getProperty(uint256 propertyId) external view returns (Property memory);
}
