// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

/// @notice Deploy `DailyCheckIn` for UTC-day streak proof on Base (or any EVM chain in the broadcast).
/// @dev Set `VITE_DAILY_CHECKIN_ADDRESS` and `DAILY_CHECKIN_CONTRACT_ADDRESS` to the logged address.
contract DeployDailyCheckInScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        DailyCheckIn checkIn = new DailyCheckIn();
        vm.stopBroadcast();
        console.log("DailyCheckIn:", address(checkIn));
    }
}
