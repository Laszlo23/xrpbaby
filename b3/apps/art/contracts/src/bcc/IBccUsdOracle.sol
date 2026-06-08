// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBccUsdOracle {
    function bccAmountForUsd(uint256 usdE6) external view returns (uint256 bccAmount);
}
