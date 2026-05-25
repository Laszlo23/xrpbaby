// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Shared math for demo seed scripts: 110% notional / $1k min whole-token price → supply cap in wei.
library SeedTokenSupply {
    /// @dev `propertyValueUsd` is whole USD (e.g. 10_000_000). Whole tokens = (value * 110%) / 1000.
    function supplyCapWei(uint256 propertyValueUsd) internal pure returns (uint256) {
        uint256 wholeTokens = (propertyValueUsd * 110) / 100 / 1000;
        return wholeTokens * 1 ether;
    }
}
