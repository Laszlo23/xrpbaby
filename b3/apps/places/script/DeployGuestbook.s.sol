// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {CommunityGuestbook} from "../src/guestbook/CommunityGuestbook.sol";

contract DeployGuestbookScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        CommunityGuestbook g = new CommunityGuestbook();
        console2.log("CommunityGuestbook:", address(g));
        vm.stopBroadcast();
    }
}
