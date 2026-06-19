// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CultureChronicles1155} from "../src/CultureChronicles1155.sol";

/// @notice Deploy Culture Chronicles ERC-1155 on Base (or any EVM via RPC_URL).
contract DeployCultureChroniclesScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address treasury = vm.envAddress("TREASURY");

        uint256 launchHours = vm.envOr("CHRONICLES_LAUNCH_HOURS", uint256(48));
        uint256 launchEndsAt = block.timestamp + launchHours * 1 hours;

        string memory baseUri = vm.envOr(
            "CHRONICLES_BASE_URI",
            string("https://app.buildingcultureid.space/chronicles/metadata/")
        );

        vm.startBroadcast(pk);

        CultureChronicles1155 chronicles = new CultureChronicles1155(
            treasury,
            launchEndsAt,
            baseUri,
            deployer
        );
        console.log("CultureChronicles1155:", address(chronicles));
        console.log("launchEndsAt:", launchEndsAt);

        vm.stopBroadcast();
    }
}
