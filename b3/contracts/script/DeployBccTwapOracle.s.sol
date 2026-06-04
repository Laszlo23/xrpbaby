// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {BccTwapOracle} from "../src/bcc/BccTwapOracle.sol";

contract DeployBccTwapOracle is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address bcc = vm.envAddress("BCC_TOKEN_ADDRESS");
        address pool = vm.envAddress("BCC_WETH_POOL_ADDRESS");
        address feed = vm.envAddress("ETH_USD_FEED");

        vm.startBroadcast(pk);
        BccTwapOracle o = new BccTwapOracle(bcc, pool, feed, vm.addr(pk));
        vm.stopBroadcast();
        console2.log("BccTwapOracle", address(o));
    }
}
