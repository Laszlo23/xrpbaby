// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PlatformSettlementToken} from "../src/PlatformSettlementToken.sol";

/// @notice Deploy fixed-supply settlement token to `receiver` (use a multisig on Base mainnet).
/// @dev Env: PLATFORM_TOKEN_NAME, PLATFORM_TOKEN_SYMBOL, PLATFORM_TOKEN_INITIAL_SUPPLY_WEI, PLATFORM_TOKEN_RECEIVER
contract DeployPlatformSettlementScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        vm.startBroadcast(pk);

        string memory name_ = vm.envString("PLATFORM_TOKEN_NAME");
        string memory symbol_ = vm.envString("PLATFORM_TOKEN_SYMBOL");
        uint256 supply = vm.envUint("PLATFORM_TOKEN_INITIAL_SUPPLY_WEI");
        address receiver = vm.envAddress("PLATFORM_TOKEN_RECEIVER");

        PlatformSettlementToken token = new PlatformSettlementToken(name_, symbol_, supply, receiver);
        console2.log("PlatformSettlementToken:", address(token));

        vm.stopBroadcast();
    }
}
