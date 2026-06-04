// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {MockBccUsdOracle} from "../src/bcc/MockBccUsdOracle.sol";

contract DeployMockBccOracle is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        uint256 rate = vm.envOr("BCC_WEI_PER_USD_E6", uint256(1_000_000_000_000_000));
        vm.startBroadcast(pk);
        MockBccUsdOracle o = new MockBccUsdOracle(rate, vm.addr(pk));
        vm.stopBroadcast();
        console2.log("MockBccUsdOracle", address(o));
    }
}
