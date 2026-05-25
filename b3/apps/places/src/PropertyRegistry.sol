// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title PropertyRegistry
/// @notice On-chain record of real-estate-related commitments: property IDs, hashed external refs,
///         optional metadata hash, 0G Storage root hashes per document kind, and record ownership.
///         This is not legal title; see docs/compliance.md.
contract PropertyRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct Property {
        bytes32 externalRefHash;
        address recordOwner;
        bytes32 metadataHash;
        bool exists;
    }

    uint256 private _nextPropertyId = 1;
    mapping(uint256 propertyId => Property) private _properties;
    mapping(bytes32 externalRefHash => uint256 propertyId) private _externalRefToPropertyId;
    mapping(uint256 propertyId => mapping(bytes32 docKind => bytes32 storageRoot)) private _documents;

    event PropertyRegistered(
        uint256 indexed propertyId,
        bytes32 indexed externalRefHash,
        address indexed initialRecordOwner,
        bytes32 metadataHash
    );
    event RecordOwnerTransferred(uint256 indexed propertyId, address indexed from, address indexed to);
    event DocumentAnchored(uint256 indexed propertyId, bytes32 indexed docKind, bytes32 storageRoot);

    error PropertyNotFound();
    error DuplicateExternalRef();
    error NotRecordOwner();
    error ZeroAddress();

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    /// @notice Register a new property. `externalRefHash` should be keccak256 of an off-chain parcel id string.
    function registerProperty(bytes32 externalRefHash, bytes32 metadataHash, address initialRecordOwner)
        external
        onlyRole(REGISTRAR_ROLE)
        returns (uint256 propertyId)
    {
        if (initialRecordOwner == address(0)) revert ZeroAddress();
        if (_externalRefToPropertyId[externalRefHash] != 0) revert DuplicateExternalRef();

        propertyId = _nextPropertyId++;
        _externalRefToPropertyId[externalRefHash] = propertyId;
        _properties[propertyId] = Property({
            externalRefHash: externalRefHash,
            recordOwner: initialRecordOwner,
            metadataHash: metadataHash,
            exists: true
        });

        emit PropertyRegistered(propertyId, externalRefHash, initialRecordOwner, metadataHash);
    }

    /// @notice Anchor a 0G Storage Merkle root for a document class (opaque docKind label).
    function addDocument(uint256 propertyId, bytes32 docKind, bytes32 storageRoot) external onlyRole(REGISTRAR_ROLE) {
        _requireExists(propertyId);
        _documents[propertyId][docKind] = storageRoot;
        emit DocumentAnchored(propertyId, docKind, storageRoot);
    }

    /// @notice Transfer application-level record ownership (e.g. after off-chain closing).
    function transferRecord(uint256 propertyId, address newOwner) external {
        _requireExists(propertyId);
        Property storage p = _properties[propertyId];
        if (msg.sender != p.recordOwner && !hasRole(REGISTRAR_ROLE, msg.sender)) {
            revert NotRecordOwner();
        }
        if (newOwner == address(0)) revert ZeroAddress();
        address prev = p.recordOwner;
        p.recordOwner = newOwner;
        emit RecordOwnerTransferred(propertyId, prev, newOwner);
    }

    function propertyExists(uint256 propertyId) external view returns (bool) {
        return _properties[propertyId].exists;
    }

    function getProperty(uint256 propertyId) external view returns (Property memory) {
        _requireExists(propertyId);
        return _properties[propertyId];
    }

    function getDocumentRoot(uint256 propertyId, bytes32 docKind) external view returns (bytes32) {
        _requireExists(propertyId);
        return _documents[propertyId][docKind];
    }

    function nextPropertyId() external view returns (uint256) {
        return _nextPropertyId;
    }

    function _requireExists(uint256 propertyId) internal view {
        if (!_properties[propertyId].exists) revert PropertyNotFound();
    }
}
