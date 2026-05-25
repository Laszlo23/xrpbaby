// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";
import {PrimaryShareSaleERC20} from "../src/PrimaryShareSaleERC20.sol";
import {PlatformSettlementToken} from "../src/PlatformSettlementToken.sol";

contract PrimaryShareSaleERC20Test is Test {
    function testBuyWholeSharesWithPaymentToken() public {
        address admin = address(0xA11);
        address registrar = address(0xB22);
        address treasury = address(0xC33);
        address buyer = address(0xD44);
        bytes32 ref = keccak256("parcel-primary-erc20");

        PlatformSettlementToken pay = new PlatformSettlementToken("Pay", "PAY", 1_000_000 ether, buyer);

        PropertyRegistry registry = new PropertyRegistry(admin);
        bytes32 registryRegistrar = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(registryRegistrar, registrar);

        vm.prank(registrar);
        uint256 pid = registry.registerProperty(ref, bytes32(0), treasury);

        ComplianceRegistry compliance = new ComplianceRegistry(admin);
        vm.startPrank(admin);
        compliance.setWalletStatus(treasury, IComplianceRegistry.Status.Verified);
        compliance.setWalletStatus(buyer, IComplianceRegistry.Status.Verified);
        vm.stopPrank();

        PropertyShareFactory shareFactory = new PropertyShareFactory(address(registry), address(compliance), admin);
        bytes32 factoryRegistrar = shareFactory.REGISTRAR_ROLE();
        vm.prank(admin);
        shareFactory.grantRole(factoryRegistrar, registrar);

        vm.prank(registrar);
        address share = shareFactory.createPropertyShare(
            pid, "Share", "SH", "https://m", 1_000_000 ether, treasury, 100_000 ether, treasury
        );

        uint256 price = 2e18;
        PrimaryShareSaleERC20 sale = new PrimaryShareSaleERC20(share, address(pay), treasury, price);

        vm.prank(treasury);
        IERC20(share).approve(address(sale), type(uint256).max);

        vm.startPrank(buyer);
        pay.approve(address(sale), type(uint256).max);
        sale.buyWholeShares(2);
        vm.stopPrank();

        assertEq(IERC20(share).balanceOf(buyer), 2 ether);
        assertEq(pay.balanceOf(treasury), 4e18);
    }

    function testRevertsBelowOneWholeShare() public {
        address admin = address(0xA11);
        address registrar = address(0xB22);
        address treasury = address(0xC33);
        address buyer = address(0xD44);

        PlatformSettlementToken pay = new PlatformSettlementToken("Pay", "PAY", 1_000_000 ether, buyer);

        PropertyRegistry registry = new PropertyRegistry(admin);
        bytes32 registrarRole = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(registrarRole, registrar);
        vm.prank(registrar);
        uint256 pid = registry.registerProperty(keccak256("p"), bytes32(0), treasury);

        ComplianceRegistry compliance = new ComplianceRegistry(admin);
        vm.startPrank(admin);
        compliance.setWalletStatus(treasury, IComplianceRegistry.Status.Verified);
        compliance.setWalletStatus(buyer, IComplianceRegistry.Status.Verified);
        vm.stopPrank();

        PropertyShareFactory shareFactory = new PropertyShareFactory(address(registry), address(compliance), admin);
        bytes32 factoryReg = shareFactory.REGISTRAR_ROLE();
        vm.prank(admin);
        shareFactory.grantRole(factoryReg, registrar);
        vm.prank(registrar);
        address share = shareFactory.createPropertyShare(
            pid, "Share", "SH", "https://m", 1_000_000 ether, treasury, 1000 ether, treasury
        );

        PrimaryShareSaleERC20 sale = new PrimaryShareSaleERC20(share, address(pay), treasury, 1 ether);
        vm.prank(treasury);
        IERC20(share).approve(address(sale), type(uint256).max);

        vm.startPrank(buyer);
        pay.approve(address(sale), type(uint256).max);
        vm.expectRevert(PrimaryShareSaleERC20.MinOneShare.selector);
        sale.buyWholeShares(0);
        vm.stopPrank();
    }
}
