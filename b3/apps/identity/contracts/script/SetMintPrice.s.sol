// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CultureLayerIdentity} from "../src/CultureLayerIdentity.sol";

/// @notice Owner calls `setMintPrice` on live CultureLayerIdentity (Base mainnet by default).
/// Env: PRIVATE_KEY, MINT_PRICE_WEI (default 370_000_000_000_000 ≈ $1.11 @ $3k/ETH), optional IDENTITY_CONTRACT_ADDRESS
contract SetMintPrice is Script {
    address internal constant MAINNET_IDENTITY = 0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 newPrice = vm.envOr("MINT_PRICE_WEI", uint256(370_000_000_000_000));
        address identity = vm.envOr("IDENTITY_CONTRACT_ADDRESS", MAINNET_IDENTITY);

        vm.startBroadcast(deployerPrivateKey);
        CultureLayerIdentity(identity).setMintPrice(newPrice);
        vm.stopBroadcast();
    }
}
