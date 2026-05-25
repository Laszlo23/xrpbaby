// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PrimaryShareSaleERC20} from "../src/PrimaryShareSaleERC20.sol";

/// @notice Deploy primary share sale with payment in an ERC-20 (e.g. platform settlement token).
/// @dev Env: PRIMARY_SHARE_TOKEN, PRIMARY_PAYMENT_TOKEN, PRIMARY_SELLER, PRIMARY_PRICE_PER_SHARE (payment token units per 1e18 shares)
contract DeployPrimaryShareERC20Script is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        vm.startBroadcast(pk);

        address shareToken = vm.envAddress("PRIMARY_SHARE_TOKEN");
        address paymentToken = vm.envAddress("PRIMARY_PAYMENT_TOKEN");
        address seller = vm.envAddress("PRIMARY_SELLER");
        uint256 price = vm.envUint("PRIMARY_PRICE_PER_SHARE");

        PrimaryShareSaleERC20 sale = new PrimaryShareSaleERC20(shareToken, paymentToken, seller, price);
        console2.log("PrimaryShareSaleERC20:", address(sale));

        vm.stopBroadcast();
    }
}
