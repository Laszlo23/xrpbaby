// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {BccOFT} from "../src/bcc/BccOFT.sol";
import {BccOFTAdapter} from "../src/bcc/BccOFTAdapter.sol";

/**
 * Deploy BCC cross-chain bridge contracts.
 *
 * Base (8453):  forge script script/DeployBccOFT.s.sol:DeployBccOFTAdapter --rpc-url $BASE_RPC --broadcast --chain-id 8453
 * BSC (56):     forge script script/DeployBccOFT.s.sol:DeployBccOFT --rpc-url $BSC_RPC --broadcast --chain-id 56
 *
 * Env: PRIVATE_KEY, BCC_TOKEN_ADDRESS (Base canonical, default 0xb890…)
 * After deploy: wire LayerZero peers, set bridge on both contracts, update bcc-56.json + app .env
 */
contract DeployBccOFT is Script {
    address constant DEFAULT_BCC = 0xB890a5289F789f1346032Ccc1847939e855FAb07;

    function run() external returns (address oft) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        oft = address(new BccOFT(msg.sender));
        vm.stopBroadcast();
        console2.log("BccOFT (BSC):", oft);
    }
}

contract DeployBccOFTAdapter is Script {
    address constant DEFAULT_BCC = 0xB890a5289F789f1346032Ccc1847939e855FAb07;

    function run() external returns (address adapter) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address bcc = vm.envOr("BCC_TOKEN_ADDRESS", DEFAULT_BCC);
        vm.startBroadcast(pk);
        adapter = address(new BccOFTAdapter(bcc, msg.sender));
        vm.stopBroadcast();
        console2.log("BccOFTAdapter (Base):", adapter);
        console2.log("BCC token:", bcc);
    }
}
