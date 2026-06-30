// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ServiceDealEscrow} from "../src/escrow/ServiceDealEscrow.sol";

/// @notice Deploy ServiceDealEscrow on Base mainnet (8453) or Sepolia.
/// Env:
///   PRIVATE_KEY — deployer
///   SERVICE_DEAL_USDC — USDC token (Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
///   SERVICE_DEAL_ADMIN — DEFAULT_ADMIN_ROLE (DAO Safe)
///   SERVICE_DEAL_AI_ORACLE — AI_ORACLE_ROLE wallet
///   SERVICE_DEAL_COUNCIL — COUNCIL_ROLE (DAO Safe or ops multisig)
///   SERVICE_DEAL_VETO_WINDOW_SECONDS — default 259200 (72h)
///   SERVICE_DEAL_DELIVER_GRACE_SECONDS — default 86400 (24h)
contract DeployServiceDealEscrowScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        address usdc = vm.envAddress("SERVICE_DEAL_USDC");
        address admin = vm.envOr("SERVICE_DEAL_ADMIN", deployer);
        address aiOracle = vm.envOr("SERVICE_DEAL_AI_ORACLE", address(0));
        address council = vm.envOr("SERVICE_DEAL_COUNCIL", admin);
        uint256 vetoWindow = vm.envOr("SERVICE_DEAL_VETO_WINDOW_SECONDS", uint256(259_200));
        uint256 grace = vm.envOr("SERVICE_DEAL_DELIVER_GRACE_SECONDS", uint256(86_400));

        vm.startBroadcast(pk);
        ServiceDealEscrow escrow = new ServiceDealEscrow(
            usdc, admin, aiOracle, council, vetoWindow, grace
        );
        vm.stopBroadcast();

        console.log("ServiceDealEscrow:", address(escrow));
        console.log("USDC:", usdc);
        console.log("Admin:", admin);
        console.log("AI Oracle:", aiOracle);
        console.log("Council:", council);
        console.log("Veto window (s):", vetoWindow);
        console.log("Deliver grace (s):", grace);
    }
}
