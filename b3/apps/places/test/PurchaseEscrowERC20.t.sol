// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PurchaseEscrowERC20} from "../src/PurchaseEscrowERC20.sol";
import {PlatformSettlementToken} from "../src/PlatformSettlementToken.sol";

contract PurchaseEscrowERC20Test is Test {
    function testFundRelease() public {
        address admin = address(0xA11);
        address registrar = address(0xB22);
        address seller = address(0xC33);
        address buyer = address(0xD44);

        PropertyRegistry registry = new PropertyRegistry(admin);
        bytes32 registrarRole = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(registrarRole, registrar);
        vm.prank(registrar);
        uint256 pid = registry.registerProperty(keccak256("lot"), bytes32(0), seller);

        PlatformSettlementToken pay = new PlatformSettlementToken("Pay", "PAY", 1_000_000 ether, buyer);
        PurchaseEscrowERC20 escrow = new PurchaseEscrowERC20(address(registry), address(pay));

        vm.prank(seller);
        uint256 eid = escrow.openEscrow(pid, buyer, 100 ether, block.timestamp + 1 days, 7 days);

        vm.startPrank(buyer);
        pay.approve(address(escrow), type(uint256).max);
        escrow.fund(eid);
        vm.stopPrank();

        vm.prank(seller);
        escrow.release(eid);

        assertEq(pay.balanceOf(seller), 100 ether);
        assertEq(IERC20(address(pay)).balanceOf(address(escrow)), 0);
    }

    function testRefundAfterWindow() public {
        address admin = address(0xA11);
        address registrar = address(0xB22);
        address seller = address(0xC33);
        address buyer = address(0xD44);

        PropertyRegistry registry = new PropertyRegistry(admin);
        bytes32 registrarRole2 = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(registrarRole2, registrar);
        vm.prank(registrar);
        uint256 pid = registry.registerProperty(keccak256("lot2"), bytes32(0), seller);

        PlatformSettlementToken pay = new PlatformSettlementToken("Pay", "PAY", 1_000_000 ether, buyer);
        PurchaseEscrowERC20 escrow = new PurchaseEscrowERC20(address(registry), address(pay));

        vm.prank(seller);
        uint256 eid = escrow.openEscrow(pid, buyer, 50 ether, block.timestamp + 1 days, 100);

        vm.startPrank(buyer);
        pay.approve(address(escrow), type(uint256).max);
        escrow.fund(eid);
        vm.stopPrank();

        (,,,,,,, PurchaseEscrowERC20.State stBefore) = escrow.escrows(eid);
        assertEq(uint256(stBefore), uint256(PurchaseEscrowERC20.State.Funded));

        vm.warp(block.timestamp + 101);

        vm.prank(buyer);
        escrow.refundBuyer(eid);

        assertEq(pay.balanceOf(buyer), 1_000_000 ether);
    }
}
