// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OgPair} from "./OgPair.sol";

/// @notice Deploys OgPair contracts; token0 is the smaller address.
contract OgFactory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairCount);

    error IdenticalAddresses();
    error ZeroAddress();
    error PairExists();

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        if (tokenA == tokenB) revert IdenticalAddresses();
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        if (token0 == address(0)) revert ZeroAddress();
        if (getPair[token0][token1] != address(0)) revert PairExists();
        OgPair p = new OgPair(token0, token1);
        pair = address(p);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }
}
