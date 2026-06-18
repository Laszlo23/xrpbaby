// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BuildingCultureDollar} from "../src/BuildingCultureDollar.sol";

/// @notice Invariant-style checks for BCC supply conservation.
contract BuildingCultureDollarInvariantTest is Test {
    address internal owner = address(0xBEEF);
    uint256 internal constant CAP = 1_000_000_000 ether;

    function test_zeroTransferPreservesSupply() public {
        BuildingCultureDollar token = new BuildingCultureDollar(owner, CAP);
        address bob = address(0xB0B);
        token.transfer(bob, 0);
        assertEq(token.totalSupply(), 0);
    }

    function test_capIsImmutable() public {
        BuildingCultureDollar token = new BuildingCultureDollar(owner, CAP);
        assertEq(token.cap(), CAP);
    }
}
