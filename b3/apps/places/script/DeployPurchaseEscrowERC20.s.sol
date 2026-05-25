// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PurchaseEscrowERC20} from "../src/PurchaseEscrowERC20.sol";

/// @notice Deploy ERC-20 purchase escrow for the payment asset (settlement token).
/// @dev Env: PROPERTY_REGISTRY, PAYMENT_TOKEN (ERC-20 address)
contract DeployPurchaseEscrowERC20Script is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address registry = vm.envAddress("PROPERTY_REGISTRY");
        address payment = vm.envAddress("PAYMENT_TOKEN");

        vm.startBroadcast(pk);
        PurchaseEscrowERC20 escrow = new PurchaseEscrowERC20(registry, payment);
        console2.log("PurchaseEscrowERC20:", address(escrow));
        vm.stopBroadcast();
    }
}
