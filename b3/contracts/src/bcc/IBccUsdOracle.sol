// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Returns BCC amount (18 decimals) required for a USD notional (6 decimals).
interface IBccUsdOracle {
    function bccAmountForUsd(uint256 usdE6) external view returns (uint256 bccAmount);
}
