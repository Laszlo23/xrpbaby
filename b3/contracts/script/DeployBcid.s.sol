// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BcidRegistry} from "../src/bcid/BcidRegistry.sol";
import {BcidSoulboundCredential} from "../src/bcid/BcidSoulboundCredential.sol";

/// @notice Deploy BCID v1 contracts to Base Sepolia (84532) or Base mainnet (8453).
/// Env:
/// - PRIVATE_KEY: deployer key
/// - BCID_MINT_PRICE_WEI (optional): default 370000000000000 (~$1.11 at ~$3000 ETH)
contract DeployBcidScript is Script {
    function run() external {
        uint256 pk = uint256(vm.envBytes32("PRIVATE_KEY"));
        address deployer = vm.addr(pk);
        uint256 mintPrice = vm.envOr("BCID_MINT_PRICE_WEI", uint256(370000000000000));

        vm.startBroadcast(pk);

        BcidRegistry registry = new BcidRegistry(deployer, mintPrice);
        BcidSoulboundCredential credentials = new BcidSoulboundCredential(deployer);

        console.log("BcidRegistry:", address(registry));
        console.log("BcidSoulboundCredential:", address(credentials));
        console.log("mintPrice:", mintPrice);
        console.log("deployer:", deployer);

        vm.stopBroadcast();
    }
}
