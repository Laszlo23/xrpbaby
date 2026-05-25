// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {SeedTokenSupply} from "./SeedTokenSupply.sol";

/// @notice Registers 4 additional demo parcels (propertyIds 4–7 after SeedThreeProperties) and deploys one share token each.
/// @dev Run only if properties 1–3 already exist. Caller must have REGISTRAR_ROLE on registry and factory.
///      USD values match `web` demo-properties 4–7; initial mint = full cap to treasury.
contract SeedFourMorePropertiesScript is Script {
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

        string[4] memory ids = [
            "OG-DEMO-AT-004-REIFNITZ",
            "OG-DEMO-AT-005-LANDMARK-WV",
            "OG-DEMO-AT-006-1210-ZINS",
            "OG-DEMO-AT-007-1010-KURZ"
        ];
        string[4] memory symbols = ["DP4", "DP5", "DP6", "DP7"];
        string[4] memory names_ = [
            "Reifnitz WHA 6 WE",
            "LandMark Weinviertel",
            "1210 Wien Zinshaus",
            "1010 Wien 7 WE Kurzzeit"
        ];
        uint256[4] memory valueUsd =
            [uint256(6_000_000), 9_500_000, 5_500_000, 14_500_000];

        vm.startBroadcast(pk);

        for (uint256 i; i < 4; ++i) {
            bytes32 externalRef = keccak256(bytes(ids[i]));
            bytes32 metadataHash = keccak256(bytes(string.concat("buildingculture:demo:metadata:", ids[i])));
            uint256 propertyId = registry.registerProperty(externalRef, metadataHash, treasury);
            console2.log("Registered", ids[i], "propertyId", propertyId);

            string memory uri = string.concat("https://buildingculture.demo/meta/at-", _toString(i + 4), ".json");

            uint256 cap = SeedTokenSupply.supplyCapWei(valueUsd[i]);
            address token = factory.createPropertyShare(
                propertyId,
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
