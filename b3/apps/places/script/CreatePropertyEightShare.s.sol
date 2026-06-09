// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {SeedTokenSupply} from "./SeedTokenSupply.sol";
import {StImmoCatalog} from "./StImmoCatalog.sol";

/// @notice Deploy OG8 share token when propertyId 8 is registered but factory mapping is empty.
contract CreatePropertyEightShareScript is Script {
    uint256 internal constant INDEX = 7;
    uint256 internal constant PROPERTY_ID = 8;

    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address deployer = vm.addr(pk);
        address factoryAddr = vm.envAddress("PROPERTY_SHARE_FACTORY");
        PropertyShareFactory factory = PropertyShareFactory(factoryAddr);

        address existing = factory.tokenByPropertyId(PROPERTY_ID);
        if (existing != address(0)) {
            console2.log("Property 8 token already set:", existing);
            return;
        }

        address treasury = deployer;
        if (vm.envExists("TREASURY_ADDRESS")) {
            address t = vm.envAddress("TREASURY_ADDRESS");
            if (t != address(0)) treasury = t;
        }

        vm.startBroadcast(pk);
        string memory uri = StImmoCatalog.metadataUri(PROPERTY_ID);
        uint256 cap = SeedTokenSupply.supplyCapWei(StImmoCatalog.acquisitionEur(INDEX));
        address token = factory.createPropertyShare(
            PROPERTY_ID,
            StImmoCatalog.name(INDEX),
            StImmoCatalog.symbol(INDEX),
            uri,
            cap,
            treasury,
            cap,
            treasury
        );
        vm.stopBroadcast();
        console2.log("OG8 share token", token);
    }
}
