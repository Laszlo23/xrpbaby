// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {PropertyReserveFeed} from "../src/reserve/PropertyReserveFeed.sol";
import {SeedTokenSupply} from "./SeedTokenSupply.sol";
import {StImmoCatalog} from "./StImmoCatalog.sol";

/// @notice Set PoR max mintable shares per property to match catalog supply caps.
contract SetPropertyReserveCapsScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address factoryAddr = vm.envAddress("PROPERTY_SHARE_FACTORY");
        address reserveFeedAddr = vm.envAddress("PROPERTY_RESERVE_FEED");

        PropertyShareFactory factory = PropertyShareFactory(factoryAddr);
        PropertyReserveFeed feed = PropertyReserveFeed(reserveFeedAddr);

        vm.startBroadcast(pk);

        for (uint256 i; i < StImmoCatalog.COUNT; ++i) {
            uint256 propertyIndex = i + 1;
            address token = factory.tokenByPropertyId(propertyIndex);
            if (token == address(0)) {
                console2.log("Skip propertyId", propertyIndex, "(no token yet)");
                continue;
            }
            uint256 cap = SeedTokenSupply.supplyCapWei(StImmoCatalog.acquisitionEur(i));
            bytes32 attestation = keccak256(bytes(StImmoCatalog.externalRef(i)));
            feed.setMaxMintableShares(propertyIndex, cap, attestation);
            console2.log("PoR cap set propertyId", propertyIndex, cap);
        }

        vm.stopBroadcast();
    }
}
