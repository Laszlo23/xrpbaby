// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BccRootsStaking} from "../src/bcc/BccRootsStaking.sol";

/// @notice Deploy Culture Roots staking on Base or Base Sepolia.
/// Env: BCC_TOKEN_ADDRESS, ADMIN_ADDRESS (Safe), optional COOLDOWN_PERIOD (default 7 days)
contract DeployBccRootsStakingScript is Script {
    function run() external returns (BccRootsStaking deployed) {
        address tokenAddr = vm.envAddress("BCC_TOKEN_ADDRESS");
        address admin = vm.envOr("ADMIN_ADDRESS", msg.sender);
        uint256 cooldown = vm.envOr("COOLDOWN_PERIOD", uint256(7 days));

        string[3] memory names = ["Seedling", "Builder Grove", "Elder Canopy"];
        uint256[3] memory locks = [uint256(30 days), uint256(90 days), uint256(180 days)];
        uint256[3] memory weights = [uint256(10_000), uint256(13_000), uint256(15_000)];

        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        deployed = new BccRootsStaking(admin, IERC20(tokenAddr), cooldown, names, locks, weights);
        vm.stopBroadcast();

        console2.log("BccRootsStaking", address(deployed));
        console2.log("stakingToken", tokenAddr);
        console2.log("admin", admin);
        console2.log("cooldownPeriod", cooldown);
    }
}
