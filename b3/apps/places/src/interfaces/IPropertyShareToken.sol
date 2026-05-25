// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title IPropertyShareToken
/// @notice REOC v1 L2 — ERC-20 bound to a single PropertyRegistry property.
/// @dev Normative spec: `docs/standards/reoc-v1.md` §3. User guide: `docs/token-standard.md`.
interface IPropertyShareToken is IERC20 {
    /// @notice REOC v1 §3.3 — Emitted when the token is deployed for a property (indexers MUST capture).
    event PropertyShareDeployed(
        uint256 indexed propertyId,
        address indexed token,
        address indexed registry,
        string metadataURI,
        uint256 supplyCap
    );

    function propertyId() external view returns (uint256);

    function REGISTRY() external view returns (address);

    function metadataURI() external view returns (string memory);

    function supplyCap() external view returns (uint256);
}
