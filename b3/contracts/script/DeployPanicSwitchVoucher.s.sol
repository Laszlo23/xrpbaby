// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PanicSwitchVoucher} from "../src/PanicSwitchVoucher.sol";

/// @notice Deploy Panic Switch hidden-track voucher NFT.
/// @dev Broadcast on Base and copy contract address into app env as PANIC_VOUCHER_NFT_CONTRACT_ADDRESS.
contract DeployPanicSwitchVoucherScript is Script {
    function run() external {
        uint256 pk = uint256(vm.envBytes32("PRIVATE_KEY"));
        address deployer = vm.addr(pk);

        string memory name_ = vm.envOr("PANIC_VOUCHER_NFT_NAME", string("Panic Switch Hidden Track Voucher"));
        string memory symbol_ = vm.envOr("PANIC_VOUCHER_NFT_SYMBOL", string("PSHV"));
        string memory baseUri_ = vm.envOr(
            "PANIC_VOUCHER_NFT_BASE_URI",
            string("https://app.buildingcultureid.space/metadata/panic-switch-voucher/")
        );

        vm.startBroadcast(pk);
        PanicSwitchVoucher voucher = new PanicSwitchVoucher(name_, symbol_, baseUri_, deployer);
        vm.stopBroadcast();

        console.log("PanicSwitchVoucher:", address(voucher));
        console.log("Owner:", deployer);
    }
}

