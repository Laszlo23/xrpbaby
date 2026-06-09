// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {StImmoCatalog} from "../script/StImmoCatalog.sol";
import {SeedTokenSupply} from "../script/SeedTokenSupply.sol";

contract SeedStImmoCatalogTest is Test {
    function test_countIsEight() public pure {
        assertEq(StImmoCatalog.COUNT, 8);
    }

    function test_berggasseSupplyCap() public pure {
        uint256 cap = SeedTokenSupply.supplyCapWei(StImmoCatalog.acquisitionEur(0));
        assertEq(cap, 17_508 ether);
    }

    function test_alterStadlSupplyCap() public pure {
        uint256 cap = SeedTokenSupply.supplyCapWei(StImmoCatalog.acquisitionEur(7));
        assertEq(cap, 715 ether);
    }

    function test_metadataUriUsesProductionReocApi() public pure {
        string memory uri = StImmoCatalog.metadataUri(1);
        assertEq(uri, "https://app.buildingcultureid.space/places/api/reoc/1");
    }
}
