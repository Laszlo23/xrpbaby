// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IComplianceRegistry} from "./interfaces/IComplianceRegistry.sol";
import {IPropertyRegistryMinimal} from "./interfaces/IPropertyRegistryMinimal.sol";
import {RestrictedPropertyShareToken} from "./RestrictedPropertyShareToken.sol";

/// @title PropertyShareFactory
/// @notice REOC v1 — deploys `RestrictedPropertyShareToken` for a registered property; caller must be record owner or registrar.
/// @dev Emits `PropertyShareCreated` per REOC v1 §3.4 for subgraph/indexer discovery. Spec: `docs/standards/reoc-v1.md`.
contract PropertyShareFactory is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    IPropertyRegistryMinimal public immutable REGISTRY;
    IComplianceRegistry public immutable COMPLIANCE;

    mapping(uint256 propertyId => address) public tokenByPropertyId;

    /// @notice REOC v1 §3.4 — Index token deployments: propertyId, token, registry, metadata URI, supply cap.
    event PropertyShareCreated(
        uint256 indexed propertyId,
        address indexed token,
        address indexed registry,
        string metadataURI,
        uint256 supplyCap
    );

    error PropertyMissing();
    error TokenAlreadyExists();
    error NotAuthorized();
    error ZeroAddress();

    constructor(address registry_, address complianceRegistry_, address admin) {
        if (complianceRegistry_ == address(0)) revert ZeroAddress();
        REGISTRY = IPropertyRegistryMinimal(registry_);
        COMPLIANCE = IComplianceRegistry(complianceRegistry_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    /// @notice Deploy share token; `admin` receives DEFAULT_ADMIN and MINTER (typically record owner).
    function createPropertyShare(
        uint256 propertyId,
        string memory name_,
        string memory symbol_,
        string memory metadataURI_,
        uint256 supplyCap_,
        address admin,
        uint256 initialSupply,
        address initialReceiver
    ) external returns (address token) {
        if (!REGISTRY.propertyExists(propertyId)) revert PropertyMissing();
        if (tokenByPropertyId[propertyId] != address(0)) revert TokenAlreadyExists();

        IPropertyRegistryMinimal.Property memory p = REGISTRY.getProperty(propertyId);
        if (msg.sender != p.recordOwner && !hasRole(REGISTRAR_ROLE, msg.sender)) {
            revert NotAuthorized();
        }
        if (admin == address(0)) revert NotAuthorized();

        token = address(
            new RestrictedPropertyShareToken(
                name_,
                symbol_,
                propertyId,
                address(REGISTRY),
                metadataURI_,
                supplyCap_,
                admin,
                initialSupply,
                initialReceiver,
                COMPLIANCE
            )
        );

        tokenByPropertyId[propertyId] = token;

        emit PropertyShareCreated(propertyId, token, address(REGISTRY), metadataURI_, supplyCap_);
    }
}
