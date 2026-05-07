// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RaffleTicketCampaign} from "../src/RaffleTicketCampaign.sol";

contract DeployRaffleScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY");
        uint256 priceWei = vm.envOr("MINT_PRICE_WEI", uint256(0.001 ether));
        uint256 maxSupply = vm.envOr("MAX_SUPPLY", uint256(1000));
        string memory baseUri = vm.envOr("BASE_URI", string("https://0x.buildingculture.capital/ipfs/"));

        vm.startBroadcast(pk);

        RaffleTicketCampaign c = new RaffleTicketCampaign(
            "BUILDCHAIN Ticket",
            "BCTIX",
            priceWei,
            maxSupply,
            treasury,
            baseUri,
            vm.addr(pk)
        );

        vm.stopBroadcast();

        console.log("RaffleTicketCampaign:", address(c));
    }
}
