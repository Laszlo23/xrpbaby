// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CulturePulseAnchor} from "../src/CulturePulseAnchor.sol";

contract DeployPulseAnchorScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        vm.startBroadcast(pk);
        CulturePulseAnchor anchor = new CulturePulseAnchor(deployer);
        vm.stopBroadcast();
        console.log("CulturePulseAnchor:", address(anchor));
    }
}
