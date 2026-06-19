// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CultureSpinningWell} from "../src/CultureSpinningWell.sol";

/// @notice Deploy CultureSpinningWell for daily play lane on Base.
/// @dev Set VITE_CULTURE_SPINNING_WELL_ADDRESS and CULTURE_SPINNING_WELL_CONTRACT_ADDRESS.
contract DeployCultureSpinningWellScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        CultureSpinningWell well = new CultureSpinningWell();
        vm.stopBroadcast();
        console.log("CultureSpinningWell:", address(well));
    }
}
