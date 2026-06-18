// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {BccFairLaunchSale} from "../src/bcc/BccFairLaunchSale.sol";
import {CulturePassBccRewards} from "../src/bcc/CulturePassBccRewards.sol";
import {BccFeeRouter} from "../src/bcc/BccFeeRouter.sol";
import {WbccRootsStaking} from "../src/bcc/WbccRootsStaking.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployBccFairLaunchSale is Script {
    function run() external returns (address sale) {
        address wbcc = vm.envAddress("WBCC_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        vm.startBroadcast();
        sale = address(new BccFairLaunchSale(msg.sender, wbcc, treasury));
        console2.log("BccFairLaunchSale:", sale);
        vm.stopBroadcast();
    }
}

contract DeployCulturePassBccRewards is Script {
    address constant DEFAULT_BCC = 0xB890a5289F789f1346032Ccc1847939e855FAb07;

    function run() external returns (address rewards) {
        address bcc = vm.envOr("BCC_TOKEN_ADDRESS", DEFAULT_BCC);
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        vm.startBroadcast();
        rewards = address(new CulturePassBccRewards(msg.sender, bcc, treasury));
        console2.log("CulturePassBccRewards:", rewards);
        vm.stopBroadcast();
    }
}

contract DeployBccFeeRouter is Script {
    address constant DEFAULT_BCC = 0xB890a5289F789f1346032Ccc1847939e855FAb07;
    address constant BURN = 0x000000000000000000000000000000000000dEaD;

    function run() external returns (address router) {
        address bcc = vm.envOr("BCC_TOKEN_ADDRESS", DEFAULT_BCC);
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address ecosystem = vm.envOr("ECOSYSTEM_ADDRESS", treasury);
        vm.startBroadcast();
        router = address(new BccFeeRouter(msg.sender, bcc, treasury, BURN, ecosystem));
        console2.log("BccFeeRouter:", router);
        vm.stopBroadcast();
    }
}

contract DeployWbccRootsStaking is Script {
    function run() external returns (address staking) {
        address wbcc = vm.envAddress("WBCC_ADDRESS");
        vm.startBroadcast();
        string[3] memory names = ["Seedling", "Builder Grove", "Elder Canopy"];
        uint256[3] memory locks = [uint256(30 days), uint256(90 days), uint256(180 days)];
        uint256[3] memory weights = [uint256(10_000), uint256(13_000), uint256(15_000)];
        staking = address(
            new WbccRootsStaking(msg.sender, IERC20(wbcc), 7 days, names, locks, weights)
        );
        console2.log("WbccRootsStaking:", staking);
        vm.stopBroadcast();
    }
}
