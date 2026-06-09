// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {SeedTokenSupply} from "./SeedTokenSupply.sol";
import {StImmoCatalog} from "./StImmoCatalog.sol";

/// @notice Registers all 8 ST-IMMO properties — for **fresh** registries only.
contract SeedStImmoPropertiesScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address deployer = vm.addr(pk);

        address registryAddr = vm.envAddress("PROPERTY_REGISTRY");
        address factoryAddr = vm.envAddress("PROPERTY_SHARE_FACTORY");

        address treasury = deployer;
        if (vm.envExists("TREASURY_ADDRESS")) {
            address t = vm.envAddress("TREASURY_ADDRESS");
            if (t != address(0)) treasury = t;
        }

        PropertyRegistry registry = PropertyRegistry(registryAddr);
        PropertyShareFactory factory = PropertyShareFactory(factoryAddr);

        vm.startBroadcast(pk);

        for (uint256 i; i < StImmoCatalog.COUNT; ++i) {
            uint256 propertyIndex = i + 1;
            bytes32 externalRef = keccak256(bytes(StImmoCatalog.externalRef(i)));
            bytes32 metadataHash =
                keccak256(bytes(string.concat("buildingculture:st-immo:", StImmoCatalog.externalRef(i))));
            uint256 propertyId = registry.registerProperty(externalRef, metadataHash, treasury);
            console2.log("Registered", StImmoCatalog.externalRef(i), "propertyId", propertyId);
            require(propertyId == propertyIndex, "unexpected property id");

            string memory uri = StImmoCatalog.metadataUri(propertyIndex);
            uint256 cap = SeedTokenSupply.supplyCapWei(StImmoCatalog.acquisitionEur(i));
            address token = factory.createPropertyShare(
                propertyId,
                StImmoCatalog.name(i),
                StImmoCatalog.symbol(i),
                uri,
                cap,
                treasury,
                cap,
                treasury
            );
            console2.log("Share token", token);
        }

        vm.stopBroadcast();
    }
}
