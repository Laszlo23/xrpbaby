// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PurchaseEscrow} from "../src/PurchaseEscrow.sol";

/// @notice Deploy PropertyRegistry then PurchaseEscrow. Set PRIVATE_KEY and use --rpc-url.
contract DeployScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address admin = vm.addr(pk);

        vm.startBroadcast(pk);
        PropertyRegistry registry = new PropertyRegistry(admin);
        PurchaseEscrow purchaseEscrow = new PurchaseEscrow(address(registry));
        vm.stopBroadcast();

        console2.log("PropertyRegistry:", address(registry));
        console2.log("PurchaseEscrow:", address(purchaseEscrow));
    }
}
