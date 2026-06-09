// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {StImmoCatalog} from "./StImmoCatalog.sol";

interface IMetadataURIAdmin {
    function setMetadataURI(string calldata newUri) external;
}

/// @notice Point existing share tokens at production REOC metadata URIs (admin on each token).
contract UpdatePropertyShareMetadataURIsScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address factoryAddr = vm.envAddress("PROPERTY_SHARE_FACTORY");
        PropertyShareFactory factory = PropertyShareFactory(factoryAddr);

        vm.startBroadcast(pk);

        for (uint256 i; i < StImmoCatalog.COUNT; ++i) {
            uint256 propertyIndex = i + 1;
            address token = factory.tokenByPropertyId(propertyIndex);
            if (token == address(0)) {
                console2.log("Skip propertyId", propertyIndex, "(no token)");
                continue;
            }
            string memory uri = StImmoCatalog.metadataUri(propertyIndex);
            IMetadataURIAdmin(token).setMetadataURI(uri);
            console2.log("Updated metadataURI propertyId", propertyIndex, uri);
        }

        vm.stopBroadcast();
    }
}
