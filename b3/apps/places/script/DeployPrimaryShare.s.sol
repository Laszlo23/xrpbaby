// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PrimaryShareSale} from "../src/PrimaryShareSale.sol";

/// @notice Deploy PrimaryShareSale for issuer primary market (whole shares only, min 1).
/// @dev Treasury must approve this contract for share tokens. Set price in wei of native OG per 1e18 shares.
contract DeployPrimaryShareScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        vm.startBroadcast(pk);

        address shareToken = vm.envAddress("PRIMARY_SHARE_TOKEN");
        address seller = vm.envAddress("PRIMARY_SELLER");
        uint256 pricePerShareWei = vm.envUint("PRIMARY_PRICE_WEI_PER_SHARE");

        PrimaryShareSale sale = new PrimaryShareSale(shareToken, seller, pricePerShareWei);
        console2.log("PrimaryShareSale:", address(sale));

        vm.stopBroadcast();
    }
}
