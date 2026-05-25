// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";
import {PrimaryShareSale} from "../src/PrimaryShareSale.sol";

contract PrimaryShareSaleTest is Test {
    function testBuyMinimumOneWholeShare() public {
        address admin = address(0xA11);
        address registrar = address(0xB22);
        address treasury = address(0xC33);
        address buyer = address(0xD44);
        bytes32 ref = keccak256("parcel-primary");

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

        uint256 price = 2 ether;
        PrimaryShareSale sale = new PrimaryShareSale(share, treasury, price);

        vm.prank(treasury);
        IERC20(share).approve(address(sale), type(uint256).max);

        vm.deal(buyer, 100 ether);
        vm.prank(buyer);
        sale.buyWholeShares{value: 2 * price}(2);

        assertEq(IERC20(share).balanceOf(buyer), 2 ether);
    }

    function testRevertsBelowOneShare() public {
        address admin = address(0xA11);
        address registrar = address(0xB22);
        address treasury = address(0xC33);
        address buyer = address(0xD44);

        PropertyRegistry registry = new PropertyRegistry(admin);
        bytes32 registryRegistrar2 = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(registryRegistrar2, registrar);
        vm.prank(registrar);
        uint256 pid = registry.registerProperty(keccak256("p"), bytes32(0), treasury);

        ComplianceRegistry compliance = new ComplianceRegistry(admin);
        vm.startPrank(admin);
        compliance.setWalletStatus(treasury, IComplianceRegistry.Status.Verified);
        compliance.setWalletStatus(buyer, IComplianceRegistry.Status.Verified);
        vm.stopPrank();

        PropertyShareFactory shareFactory = new PropertyShareFactory(address(registry), address(compliance), admin);
        bytes32 factoryRegistrar2 = shareFactory.REGISTRAR_ROLE();
        vm.prank(admin);
        shareFactory.grantRole(factoryRegistrar2, registrar);
        vm.prank(registrar);
        address share = shareFactory.createPropertyShare(
            pid, "Share", "SH", "https://m", 1_000_000 ether, treasury, 1000 ether, treasury
        );

        PrimaryShareSale sale = new PrimaryShareSale(share, treasury, 1 ether);
        vm.prank(treasury);
        IERC20(share).approve(address(sale), type(uint256).max);

        vm.deal(buyer, 10 ether);
        vm.prank(buyer);
        vm.expectRevert(PrimaryShareSale.MinOneShare.selector);
        sale.buyWholeShares{value: 0}(0);
    }
}
