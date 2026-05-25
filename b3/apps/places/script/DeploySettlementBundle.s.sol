// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PlatformSettlementToken} from "../src/PlatformSettlementToken.sol";
import {PurchaseEscrowERC20} from "../src/PurchaseEscrowERC20.sol";

/// @notice Single broadcast: settlement token then escrow (avoids nonce collisions from back-to-back forge runs).
/// @dev Env: same as DeployPlatformSettlement + PROPERTY_REGISTRY from chain (registry is not created here).
contract DeploySettlementBundleScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        vm.startBroadcast(pk);

        string memory name_ = vm.envString("PLATFORM_TOKEN_NAME");
        string memory symbol_ = vm.envString("PLATFORM_TOKEN_SYMBOL");
        uint256 supply = vm.envUint("PLATFORM_TOKEN_INITIAL_SUPPLY_WEI");
        address receiver = vm.envAddress("PLATFORM_TOKEN_RECEIVER");

        PlatformSettlementToken token = new PlatformSettlementToken(name_, symbol_, supply, receiver);
        console2.log("PlatformSettlementToken:", address(token));

        address registry = vm.envAddress("PROPERTY_REGISTRY");
        PurchaseEscrowERC20 escrow = new PurchaseEscrowERC20(registry, address(token));
        console2.log("PurchaseEscrowERC20:", address(escrow));

        vm.stopBroadcast();
    }
}
