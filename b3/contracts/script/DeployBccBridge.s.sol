// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {WrappedBCC} from "../src/bcc/WrappedBCC.sol";
import {BccBridgeVault} from "../src/bcc/BccBridgeVault.sol";

/// @notice Deploy wBCC + BccBridgeVault. Wire relayer via WireBccBridge.
contract DeployBccBridge is Script {
    address constant DEFAULT_BCC = 0xB890a5289F789f1346032Ccc1847939e855FAb07;
    uint256 constant BSC_CHAIN_ID = 56;

    function run() external returns (address vault, address wbcc) {
        address bcc = vm.envOr("BCC_TOKEN_ADDRESS", DEFAULT_BCC);
        vm.startBroadcast();
        vault = address(new BccBridgeVault(bcc, BSC_CHAIN_ID, msg.sender));
        console2.log("BccBridgeVault:", vault);
        vm.stopBroadcast();
    }
}

contract DeployWrappedBCC is Script {
    address constant DEFAULT_BCC = 0xB890a5289F789f1346032Ccc1847939e855FAb07;

    function run() external returns (address wbcc) {
        address bcc = vm.envOr("BCC_TOKEN_ADDRESS", DEFAULT_BCC);
        vm.startBroadcast();
        wbcc = address(new WrappedBCC(bcc, msg.sender));
        console2.log("WrappedBCC (wBCC):", wbcc);
        vm.stopBroadcast();
    }
}

contract WireBccBridge is Script {
    function run() external {
        address vault = vm.envAddress("BCC_BRIDGE_VAULT");
        address wbcc = vm.envAddress("WBCC_ADDRESS");
        address relayer = vm.envAddress("BRIDGE_RELAYER_ADDRESS");

        vm.startBroadcast();
        BccBridgeVault(vault).setBridge(relayer);
        WrappedBCC(wbcc).setBridge(relayer);
        vm.stopBroadcast();

        console2.log("Wired relayer", relayer, "to vault + wBCC");
    }
}
