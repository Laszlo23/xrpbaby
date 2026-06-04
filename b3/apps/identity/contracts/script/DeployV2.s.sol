// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {CultureLayerIdentityV2} from "../src/CultureLayerIdentityV2.sol";

contract DeployIdentityV2 is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        uint256 mintPrice = vm.envOr("MINT_PRICE_WEI", uint256(370_000_000_000_000));
        address bcc = vm.envAddress("BCC_TOKEN_ADDRESS");
        address oracle = vm.envAddress("BCC_ORACLE_ADDRESS");
        address treasury = vm.envOr("BCC_TREASURY", vm.addr(pk));

        vm.startBroadcast(pk);
        CultureLayerIdentityV2 c = new CultureLayerIdentityV2(
            vm.addr(pk),
            mintPrice,
            bcc,
            oracle,
            treasury
        );
        vm.stopBroadcast();

        console2.log("CultureLayerIdentityV2", address(c));
    }
}
