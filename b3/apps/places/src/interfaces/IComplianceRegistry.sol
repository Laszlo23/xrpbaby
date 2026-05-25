// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice KYC / eligibility + system contracts (DEX pairs, router, lending) for restricted tokens.
interface IComplianceRegistry {
    enum Status {
        None,
        Pending,
        Verified,
        Revoked
    }

    function statusOf(address wallet) external view returns (Status);

    function isVerified(address wallet) external view returns (bool);

    /// @notice Router, OgPair, lending pool, etc.
    function isSystemContract(address account) external view returns (bool);
}
