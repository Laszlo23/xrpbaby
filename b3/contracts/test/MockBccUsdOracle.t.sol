// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockBccUsdOracle} from "../src/bcc/MockBccUsdOracle.sol";

contract MockBccUsdOracleTest is Test {
    MockBccUsdOracle internal oracle;

    function setUp() public {
        oracle = new MockBccUsdOracle(1e18, address(this));
    }

    function test_BccAmountForUsd() public view {
        uint256 oneDollar = oracle.bccAmountForUsd(1_000_000);
        assertEq(oneDollar, 1e18);
        uint256 discounted = (oneDollar * 8889) / 10_000;
        assertEq(discounted, 888_900_000_000_000_000);
    }

    function test_ZeroUsd() public view {
        assertEq(oracle.bccAmountForUsd(0), 0);
    }
}
