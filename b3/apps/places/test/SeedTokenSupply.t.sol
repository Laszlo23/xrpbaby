// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SeedTokenSupply} from "../script/SeedTokenSupply.sol";

contract SeedTokenSupplyTest is Test {
    function testTenMillionUsdYieldsElevenThousandWholeTokensWei() public pure {
        uint256 cap = SeedTokenSupply.supplyCapWei(10_000_000);
        assertEq(cap, 11_000 ether);
    }
}
