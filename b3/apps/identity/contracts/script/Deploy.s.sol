// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CultureLayerIdentity} from "../src/CultureLayerIdentity.sol";

contract Deploy is Script {
    function run() external returns (CultureLayerIdentity) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // Default ~$1.11 USD at $3,000/ETH — override via MINT_PRICE_WEI or scripts/identity-mint-price-wei.mjs
        uint256 mintPrice = vm.envOr("MINT_PRICE_WEI", uint256(370_000_000_000_000));

        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);
        CultureLayerIdentity nft = new CultureLayerIdentity(deployer, mintPrice);
        vm.stopBroadcast();

        return nft;
    }
}
