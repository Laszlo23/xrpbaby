// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Testnet oracle: WETH per 1e18 wei of `token` (18-decimal price).
contract MockPriceOracle is AccessControl {
    mapping(address token => uint256 priceE18) public priceOf;

    event PriceUpdated(address indexed token, uint256 priceE18);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function setPrice(address token, uint256 priceE18) external onlyRole(DEFAULT_ADMIN_ROLE) {
        priceOf[token] = priceE18;
        emit PriceUpdated(token, priceE18);
    }

    function getPrice(address token) external view returns (uint256) {
        return priceOf[token];
    }
}
