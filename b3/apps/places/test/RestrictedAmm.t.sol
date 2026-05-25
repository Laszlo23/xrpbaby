// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";
import {OgFactory} from "../src/defi/OgFactory.sol";
import {OgRouter} from "../src/defi/OgRouter.sol";
import {WETH9} from "../src/defi/WETH9.sol";

/// @notice Restricted share + AMM: compliance must allowlist each `OgPair` before liquidity/swap.
contract RestrictedAmmTest is Test {
    function testRestrictedSwapPath() public {
        address admin = address(0xA11);
        address registrar = address(0xB22);
        address lpUser = address(0xC33);
        address buyer = address(0xD44);
        bytes32 ref = keccak256("parcel-amm");

        PropertyRegistry registry = new PropertyRegistry(admin);
        bytes32 regRole = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(regRole, registrar);

        vm.prank(registrar);
        uint256 pid = registry.registerProperty(ref, bytes32(0), lpUser);

        ComplianceRegistry compliance = new ComplianceRegistry(admin);
        vm.startPrank(admin);
        compliance.setWalletStatus(lpUser, IComplianceRegistry.Status.Verified);
        compliance.setWalletStatus(buyer, IComplianceRegistry.Status.Verified);
        vm.stopPrank();

        PropertyShareFactory shareFactory = new PropertyShareFactory(address(registry), address(compliance), admin);
        bytes32 factoryRegistrarRole = shareFactory.REGISTRAR_ROLE();
        vm.prank(admin);
        shareFactory.grantRole(factoryRegistrarRole, registrar);

        vm.prank(registrar);
        address share = shareFactory.createPropertyShare(
            pid, "Share", "SH", "https://m", 1_000_000 ether, lpUser, 50_000 ether, lpUser
        );

        WETH9 weth = new WETH9();
        OgFactory ogFactory = new OgFactory();
        OgRouter router = new OgRouter(address(ogFactory), address(weth));

        vm.prank(admin);
        compliance.setSystemContract(address(router), true);

        vm.prank(lpUser);
        ogFactory.createPair(address(weth), share);
        address pair = ogFactory.getPair(address(weth), share);
        vm.prank(admin);
        compliance.setSystemContract(pair, true);

        vm.deal(lpUser, 100 ether);
        vm.startPrank(lpUser);
        weth.deposit{value: 10 ether}();
        IERC20(address(weth)).approve(address(router), type(uint256).max);
        IERC20(share).approve(address(router), type(uint256).max);
        router.addLiquidity(address(weth), share, 5 ether, 5000 ether, 0, 0, lpUser, block.timestamp + 1);
        vm.stopPrank();

        vm.deal(buyer, 10 ether);
        vm.startPrank(buyer);
        weth.deposit{value: 1 ether}();
        IERC20(address(weth)).approve(address(router), type(uint256).max);
        uint256 out = router.swapExactTokensForTokens(
            1 ether, 0, address(weth), share, buyer, block.timestamp + 1
        );
        vm.stopPrank();

        assertGt(out, 0);
        assertGt(IERC20(share).balanceOf(buyer), 0);
    }
}
