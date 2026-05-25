// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {OgRouter} from "../src/defi/OgRouter.sol";
import {WETH9} from "../src/defi/WETH9.sol";

/// @notice For each seeded propertyId in [START, END], wrap native OG, add WETH/share liquidity, allowlist the pair.
/// @dev Run after deploy + seed. Set env vars below. Requires `msg.sender` to hold enough share + OG balance.
contract BootstrapLiquidityScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address deployer = vm.addr(pk);

        address routerAddr = vm.envAddress("OG_ROUTER");
        address wethAddr = vm.envAddress("OG_WETH");
        address complianceAddr = vm.envAddress("COMPLIANCE_REGISTRY");
        address factoryAddr = vm.envAddress("PROPERTY_SHARE_FACTORY");

        uint256 startId = vm.envOr("START_PROPERTY_ID", uint256(1));
        uint256 endId = vm.envOr("END_PROPERTY_ID", uint256(7));

        uint256 wethAmount = vm.envUint("BOOTSTRAP_WETH_WEI");
        uint256 shareAmount = vm.envUint("BOOTSTRAP_SHARE_WEI");

        vm.startBroadcast(pk);

        OgRouter router = OgRouter(payable(routerAddr));
        WETH9 weth = WETH9(payable(wethAddr));
        ComplianceRegistry compliance = ComplianceRegistry(complianceAddr);
        PropertyShareFactory factory = PropertyShareFactory(factoryAddr);

        uint256 deadline = block.timestamp + 1 hours;

        for (uint256 pid = startId; pid <= endId; ++pid) {
            address share = factory.tokenByPropertyId(pid);
            if (share == address(0)) {
                console2.log("skip propertyId (no token)", pid);
                continue;
            }

            weth.deposit{value: wethAmount}();
            IERC20(address(weth)).approve(address(router), type(uint256).max);
            IERC20(share).approve(address(router), type(uint256).max);

            router.addLiquidity(address(weth), share, wethAmount, shareAmount, 0, 0, deployer, deadline);

            address pair = router.getPair(address(weth), share);
            require(pair != address(0), "pair missing");
            compliance.setSystemContract(pair, true);
            console2.log("Bootstrapped propertyId", pid, "pair", pair);
        }

        vm.stopBroadcast();
    }
}
