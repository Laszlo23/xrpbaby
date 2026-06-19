// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PanicSwitchAttestation} from "../src/PanicSwitchAttestation.sol";

/// @notice Deploy `PanicSwitchAttestation` on Base (or any EVM chain in the broadcast).
contract DeployPanicSwitchAttestationScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        PanicSwitchAttestation attestation = new PanicSwitchAttestation();
        vm.stopBroadcast();
        console.log("PanicSwitchAttestation:", address(attestation));
    }
}
