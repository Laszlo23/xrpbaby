// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {BuildingCultureTicket} from "../src/BuildingCultureTicket.sol";
import {BuildingCultureHub} from "../src/BuildingCultureHub.sol";

/// @notice Deploy: `forge script script/Deploy.s.sol --rpc-url base --broadcast --verify`
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        // ~$45 and ~$40 at ~$2500/ETH — override via env for testnets
        uint96 horizonPrice = uint96(vm.envOr("HORIZON_TICKET_PRICE_WEI", uint256(0.000018 ether)));
        uint96 stormPrice = uint96(vm.envOr("STORM_TICKET_PRICE_WEI", uint256(0.000028 ether)));

        vm.startBroadcast(deployerKey);

        BuildingCultureTicket tickets = new BuildingCultureTicket(deployer);
        BuildingCultureHub hub = new BuildingCultureHub(address(tickets), deployer);
        tickets.setHub(address(hub));

        uint256 horizonId = hub.createEdition("horizon", horizonPrice, 1000, deployer);
        uint256 stormId = hub.createEdition("storm", stormPrice, 1000, deployer);

        vm.stopBroadcast();

        console2.log("Deployer", deployer);
        console2.log("Ticket", address(tickets));
        console2.log("Hub", address(hub));
        console2.log("Horizon editionId", horizonId);
        console2.log("Storm editionId", stormId);
    }
}
