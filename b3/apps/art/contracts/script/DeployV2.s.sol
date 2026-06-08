// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {BuildingCultureTicket} from "../src/BuildingCultureTicket.sol";
import {BuildingCultureHubV2} from "../src/BuildingCultureHubV2.sol";

/// @notice Deploy Hub V2 + ticket with BCC rail. Requires BCC_ORACLE_ADDRESS.
contract DeployV2 is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address bcc = vm.envAddress("BCC_TOKEN_ADDRESS");
        address oracle = vm.envAddress("BCC_ORACLE_ADDRESS");
        address treasury = vm.envOr("BCC_TREASURY", deployer);

        uint96 horizonPrice = uint96(vm.envOr("HORIZON_TICKET_PRICE_WEI", uint256(0.000018 ether)));
        uint96 stormPrice = uint96(vm.envOr("STORM_TICKET_PRICE_WEI", uint256(0.000028 ether)));
        uint64 horizonUsdE6 = uint64(vm.envOr("HORIZON_TICKET_USD_E6", uint256(45_000_000)));
        uint64 stormUsdE6 = uint64(vm.envOr("STORM_TICKET_USD_E6", uint256(40_000_000)));

        vm.startBroadcast(deployerKey);

        BuildingCultureTicket tickets = new BuildingCultureTicket(deployer);
        BuildingCultureHubV2 hub = new BuildingCultureHubV2(
            address(tickets),
            bcc,
            oracle,
            treasury,
            deployer
        );
        tickets.setHub(address(hub));

        uint256 horizonId = hub.createEdition("horizon", horizonPrice, horizonUsdE6, 1000, deployer);
        uint256 stormId = hub.createEdition("storm", stormPrice, stormUsdE6, 1000, deployer);

        vm.stopBroadcast();

        console2.log("Deployer", deployer);
        console2.log("TicketV2", address(tickets));
        console2.log("HubV2", address(hub));
        console2.log("Horizon editionId", horizonId);
        console2.log("Storm editionId", stormId);
    }
}
