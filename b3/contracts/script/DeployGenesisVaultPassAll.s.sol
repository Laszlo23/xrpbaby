// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {GenesisVaultPass} from "../src/GenesisVaultPass.sol";

/// @notice Deploy all three Genesis Vault Pass tiers in one broadcast (Base / any EVM chain via RPC_URL).
contract DeployGenesisVaultPassAllScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address treasury = vm.envAddress("TREASURY");

        uint256 price0 = vm.envOr("GVP_PHASE0_MINT_PRICE_WEI", uint256(0.005 ether));
        uint256 price1 = vm.envOr("GVP_PHASE1_MINT_PRICE_WEI", uint256(0.003 ether));
        uint256 price2 = vm.envOr("GVP_PHASE2_MINT_PRICE_WEI", uint256(0.001 ether));

        uint256 max0 = vm.envOr("GVP_PHASE0_MAX_SUPPLY", uint256(333));
        uint256 max1 = vm.envOr("GVP_PHASE1_MAX_SUPPLY", uint256(777));
        uint256 max2 = vm.envOr("GVP_PHASE2_MAX_SUPPLY", uint256(1500));

        string memory base0 = vm.envOr(
            "GVP_PHASE0_BASE_URI",
            string("https://0x.buildingculture.capital/meta/genesis-vault-pass/phase0/")
        );
        string memory base1 = vm.envOr(
            "GVP_PHASE1_BASE_URI",
            string("https://0x.buildingculture.capital/meta/genesis-vault-pass/phase1/")
        );
        string memory base2 = vm.envOr(
            "GVP_PHASE2_BASE_URI",
            string("https://0x.buildingculture.capital/meta/genesis-vault-pass/phase2/")
        );

        vm.startBroadcast(pk);

        GenesisVaultPass p0 = new GenesisVaultPass(
            "Genesis Vault Pass - Phase 0",
            "GVP0",
            price0,
            max0,
            treasury,
            base0,
            deployer
        );
        console.log("GenesisVaultPass Phase0:", address(p0));

        GenesisVaultPass p1 = new GenesisVaultPass(
            "Genesis Vault Pass - Phase 1",
            "GVP1",
            price1,
            max1,
            treasury,
            base1,
            deployer
        );
        console.log("GenesisVaultPass Phase1:", address(p1));

        GenesisVaultPass p2 = new GenesisVaultPass(
            "Genesis Vault Pass - Phase 2",
            "GVP2",
            price2,
            max2,
            treasury,
            base2,
            deployer
        );
        console.log("GenesisVaultPass Phase2:", address(p2));

        vm.stopBroadcast();
    }
}
