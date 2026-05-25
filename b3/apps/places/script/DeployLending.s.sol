// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SimpleLendingPool} from "../src/defi/SimpleLendingPool.sol";
import {MockPriceOracle} from "../src/defi/MockPriceOracle.sol";

/// @notice Deploy SimpleLendingPool for one collateral token. Requires WETH9 + MockPriceOracle from DeployAll.
/// @dev Env: PRIVATE_KEY, LENDING_COLLATERAL_TOKEN, WETH9, MOCK_PRICE_ORACLE, PRICE_WETH_PER_TOKEN_E18 (optional, default 1e15)
contract DeployLendingScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));

        address collateral = vm.envAddress("LENDING_COLLATERAL_TOKEN");
        address weth = vm.envAddress("WETH9");
        address oracleAddr = vm.envAddress("MOCK_PRICE_ORACLE");

        uint256 priceE18 = 1e15; // 0.001 WETH per 1 token (18 decimals) — override for demos
        if (vm.envExists("PRICE_WETH_PER_TOKEN_E18")) {
            priceE18 = vm.envUint("PRICE_WETH_PER_TOKEN_E18");
        }

        vm.startBroadcast(pk);
        SimpleLendingPool pool = new SimpleLendingPool(collateral, weth, oracleAddr);
        MockPriceOracle(oracleAddr).setPrice(collateral, priceE18);
        vm.stopBroadcast();

        console2.log("SimpleLendingPool:", address(pool));
        console2.log("Oracle price (WETH per 1e18 collateral wei) set to:", priceE18);
        console2.log("Set NEXT_PUBLIC_LENDING_POOL in web/.env.local");
    }
}
