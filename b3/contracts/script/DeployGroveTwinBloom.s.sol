// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {GroveTwinBloomVoucher} from "../src/GroveTwinBloomVoucher.sol";

/// @notice Deploy Culture Grove Twin Bloom audio NFT voucher.
/// @dev Copy contract address into GROVE_TWIN_BLOOM_NFT_CONTRACT_ADDRESS.
contract DeployGroveTwinBloomScript is Script {
    function run() external {
        uint256 pk = uint256(vm.envBytes32("PRIVATE_KEY"));
        address deployer = vm.addr(pk);

        string memory name_ = vm.envOr("GROVE_TWIN_BLOOM_NFT_NAME", string("Building Culture — Twin Bloom"));
        string memory symbol_ = vm.envOr("GROVE_TWIN_BLOOM_NFT_SYMBOL", string("GBTW"));
        string memory baseUri_ = vm.envOr(
            "GROVE_TWIN_BLOOM_NFT_BASE_URI",
            string("https://app.buildingcultureid.space/metadata/grove-twin-bloom/")
        );

        vm.startBroadcast(pk);
        GroveTwinBloomVoucher voucher = new GroveTwinBloomVoucher(name_, symbol_, baseUri_, deployer);
        vm.stopBroadcast();

        console.log("GroveTwinBloomVoucher:", address(voucher));
        console.log("Owner:", deployer);
    }
}
