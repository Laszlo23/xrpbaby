// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {SeedTokenSupply} from "./SeedTokenSupply.sol";

/// @notice Idempotent completion of `SeedSevenProperties` after a partial broadcast (e.g. RPC rate limits).
/// Skips properties that already have a share token; registers + mints missing entries in order 1..7.
contract FinishSeedSevenPropertiesScript is Script {
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

        string[7] memory ids = [
            "DEMO-AT-001-VIER-HAEUSER",
            "DEMO-AT-002-1130-10WE",
            "DEMO-AT-003-KEUTSCHACH",
            "DEMO-AT-004-REIFNITZ",
            "DEMO-AT-005-LANDMARK-WV",
            "DEMO-AT-006-1210-ZINS",
            "DEMO-AT-007-1010-KURZ"
        ];
        string[7] memory symbols = ["OG1", "OG2", "OG3", "OG4", "OG5", "OG6", "OG7"];
        string[7] memory names_ = [
            "Gesellschaft Wohnungen 4 Haeuser",
            "1130 Wien MFH 10 WE",
            "Keutschach WHA 8 WE",
            "Reifnitz WHA 6 WE",
            "LandMark Weinviertel",
            "1210 Wien Zinshaus",
            "1010 Wien 7 WE Kurzzeit"
        ];
        uint256[7] memory valueUsd = [
            uint256(17_575_000),
            7_000_000,
            9_500_000,
            6_000_000,
            9_500_000,
            5_500_000,
            14_500_000
        ];

        vm.startBroadcast(pk);

        for (uint256 i; i < 7; ++i) {
            uint256 propertyIndex = i + 1;

            if (factory.tokenByPropertyId(propertyIndex) != address(0)) {
                console2.log("Skip propertyId", propertyIndex, "(token already set)");
                continue;
            }

            if (!registry.propertyExists(propertyIndex)) {
                bytes32 externalRef = keccak256(bytes(ids[i]));
                bytes32 metadataHash = keccak256(bytes(string.concat("buildingculture:demo:metadata:", ids[i])));
                uint256 pid = registry.registerProperty(externalRef, metadataHash, treasury);
                console2.log("Registered", ids[i], "propertyId", pid);
                require(pid == propertyIndex, "unexpected property id");
            }

            string memory uri = string.concat("https://buildingculture.demo/meta/at-", _toString(propertyIndex), ".json");
            uint256 cap = SeedTokenSupply.supplyCapWei(valueUsd[i]);
            address token = factory.createPropertyShare(
                propertyIndex,
                names_[i],
                symbols[i],
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

    function _toString(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        j = len;
        while (v != 0) {
            j--;
            bstr[j] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(bstr);
    }
}
