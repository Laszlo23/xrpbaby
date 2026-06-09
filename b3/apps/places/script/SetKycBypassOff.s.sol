// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";

/// @notice Disable KYC bypass on production ComplianceRegistry (required before retail).
contract SetKycBypassOffScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address complianceAddr = vm.envAddress("COMPLIANCE_REGISTRY");
        ComplianceRegistry compliance = ComplianceRegistry(complianceAddr);

        vm.startBroadcast(pk);
        compliance.setKycBypass(false);
        vm.stopBroadcast();

        console2.log("kycBypass set to false on", complianceAddr);
    }
}
