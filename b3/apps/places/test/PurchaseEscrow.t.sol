// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PurchaseEscrow} from "../src/PurchaseEscrow.sol";

contract PurchaseEscrowTest is Test {
    PropertyRegistry internal registry;
    PurchaseEscrow internal escrow;

    address internal admin = address(0xA11);
    address internal registrar = address(0xB22);
    address internal seller = address(0x1111111111111111111111111111111111111111);
    address internal buyer = address(0x2222222222222222222222222222222222222222);

    bytes32 internal constant REF = keccak256("parcel-xyz");

    function setUp() public {
        registry = new PropertyRegistry(admin);
        bytes32 regRole = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(regRole, registrar);

        vm.prank(registrar);
        uint256 pid = registry.registerProperty(REF, bytes32(0), seller);

        escrow = new PurchaseEscrow(address(registry));
        assertEq(pid, 1);
    }

    function testFundRelease() public {
        uint256 price = 1 ether;
        uint256 fundBefore = block.timestamp + 1 days;
        uint256 window = 2 days;

        vm.prank(seller);
        uint256 eid = escrow.openEscrow(1, buyer, price, fundBefore, window);

        vm.deal(buyer, price);
        vm.prank(buyer);
        escrow.fund{value: price}(eid);

        uint256 sellerBefore = seller.balance;
        vm.prank(seller);
        escrow.release(eid);
        assertEq(seller.balance - sellerBefore, price);
    }

    function testRefundAfterDeadline() public {
        uint256 price = 1 ether;
        uint256 fundBefore = block.timestamp + 1 days;
        uint256 window = 1 hours;

        vm.prank(seller);
        uint256 eid = escrow.openEscrow(1, buyer, price, fundBefore, window);

        vm.deal(buyer, price);
        vm.prank(buyer);
        escrow.fund{value: price}(eid);

        vm.warp(block.timestamp + window + 1);

        uint256 buyerBefore = buyer.balance;
        vm.prank(buyer);
        escrow.refundBuyer(eid);
        assertEq(buyer.balance - buyerBefore, price);
    }

    function testCancelOpen() public {
        uint256 fundBefore = block.timestamp + 1 days;
        vm.prank(seller);
        uint256 eid = escrow.openEscrow(1, buyer, 1 ether, fundBefore, 1 days);

        vm.prank(seller);
        escrow.cancelOpen(eid);
        (,,,,,,, PurchaseEscrow.State s) = escrow.escrows(eid);
        assertEq(uint256(s), uint256(PurchaseEscrow.State.Cancelled));
    }
}
