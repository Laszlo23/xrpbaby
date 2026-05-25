// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice WETH-equivalent price per 1e18 token units (18-decimal).
interface IPriceOracle {
  function getPrice(address token) external view returns (uint256 priceE18);
}
