// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgentShareCampaign} from "../src/AgentShareCampaign.sol";

contract DeployAgentShareScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY");
        address liquidityVault = vm.envAddress("LIQUIDITY_VAULT");

        uint256 mintPriceWei = vm.envOr("AGENT_MINT_PRICE_WEI", uint256(0.005 ether));
        uint256 dailyCap = vm.envOr("AGENT_DAILY_MINT_CAP", uint256(500));
        uint16 liquidityBps = uint16(vm.envOr("AGENT_LIQUIDITY_BPS", uint256(500))); // 5%
        uint16 referrerBps = uint16(vm.envOr("AGENT_REFERRER_BPS", uint256(500))); // 5%

        string memory baseUri = vm.envOr("AGENT_BASE_URI", string("https://0x.buildingculture.capital/meta/agent/"));

        vm.startBroadcast(pk);

        AgentShareCampaign c = new AgentShareCampaign(
            "BUILDCHAIN Agent Share",
            "BCAGENT",
            mintPriceWei,
            dailyCap,
            treasury,
            liquidityVault,
            liquidityBps,
            referrerBps,
            baseUri,
            vm.addr(pk)
        );

        vm.stopBroadcast();

        console.log("AgentShareCampaign:", address(c));
    }
}
