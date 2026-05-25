// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgentId} from "../src/AgentId.sol";

/// @notice Deploy the minimal AgentId ERC721 for 0G hackathon proof.
/// Env:
/// - PRIVATE_KEY: deployer key (uint)
/// - AGENT_ID_NAME (optional): default "0G Agent ID"
/// - AGENT_ID_SYMBOL (optional): default "AGENTID"
/// - AGENT_ID_BASE_URI (optional): default "https://app.buildingculture.capital/0g/agentid/"
/// - AGENT_ID_MINT_TO (optional): address to mint token #1 to (defaults to deployer)
contract DeployAgentIdScript is Script {
    function run() external {
        // Support hex private keys (0x...) as commonly stored in .env files.
        uint256 pk = uint256(vm.envBytes32("PRIVATE_KEY"));
        address deployer = vm.addr(pk);

        string memory name_ = vm.envOr("AGENT_ID_NAME", string("0G Agent ID"));
        string memory symbol_ = vm.envOr("AGENT_ID_SYMBOL", string("AGENTID"));
        string memory baseUri_ = vm.envOr(
            "AGENT_ID_BASE_URI", string("https://app.buildingculture.capital/0g/agentid/")
        );

        address mintTo;
        try vm.envAddress("AGENT_ID_MINT_TO") returns (address a) {
            mintTo = a;
        } catch {
            mintTo = deployer;
        }

        vm.startBroadcast(pk);
        AgentId agentId = new AgentId(name_, symbol_, baseUri_, deployer);
        console.log("AgentId:", address(agentId));
        uint256 tokenId = agentId.mint(mintTo);
        console.log("Minted tokenId:", tokenId);
        console.log("Minted to:", mintTo);
        vm.stopBroadcast();
    }
}

