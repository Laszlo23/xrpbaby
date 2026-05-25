// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ChainlinkPriceOracle} from "../src/defi/ChainlinkPriceOracle.sol";
import {PropertyReserveFeed} from "../src/reserve/PropertyReserveFeed.sol";
import {ChainlinkAceAdapter} from "../src/compliance/ChainlinkAceAdapter.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";

/// @notice Deploy Chainlink-aligned modules. Set CHAINLINK_ETH_USD_FEED for Base mainnet feed address.
contract DeployChainlinkModulesScript is Script {
  function run() external {
    uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
    address admin = vm.addr(pk);
    address ethUsd = vm.envOr("CHAINLINK_ETH_USD_FEED", address(0));

    vm.startBroadcast(pk);
    ChainlinkPriceOracle priceOracle = new ChainlinkPriceOracle(admin, ethUsd);
    PropertyReserveFeed reserveFeed = new PropertyReserveFeed(admin);
    ComplianceRegistry compliance = ComplianceRegistry(vm.envAddress("COMPLIANCE_REGISTRY"));
    ChainlinkAceAdapter aceAdapter = new ChainlinkAceAdapter(compliance, admin);
    vm.stopBroadcast();

    console2.log("ChainlinkPriceOracle:", address(priceOracle));
    console2.log("PropertyReserveFeed:", address(reserveFeed));
    console2.log("ChainlinkAceAdapter:", address(aceAdapter));
  }
}
