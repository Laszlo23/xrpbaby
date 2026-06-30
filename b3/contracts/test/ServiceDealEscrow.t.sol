// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ServiceDealEscrow} from "../src/escrow/ServiceDealEscrow.sol";

contract MockUsdc is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ServiceDealEscrowTest is Test {
    MockUsdc internal usdc;
    ServiceDealEscrow internal escrow;

    address internal admin = address(0xA11);
    address internal payer = address(0xB22);
    address internal provider = address(0xC33);
    address internal aiOracle = address(0xD44);
    address internal council = address(0xE55);

    bytes32 internal metadataHash = keccak256("deal-json");
    bytes32 internal evidenceHash = keccak256("evidence-json");
    bytes32 internal rulingHash = keccak256("ruling-json");

    uint256 internal constant AMOUNT = 1_000_000; // 1 USDC
    uint256 internal constant VETO_WINDOW = 3 days;
    uint256 internal constant GRACE = 1 days;

    function setUp() public {
        usdc = new MockUsdc();
        escrow = new ServiceDealEscrow(
            address(usdc), admin, aiOracle, council, VETO_WINDOW, GRACE
        );
        usdc.mint(payer, 10 * AMOUNT);
    }

    function _createAndFund() internal returns (uint256 dealId) {
        vm.prank(payer);
        dealId = escrow.createDeal(provider, AMOUNT, metadataHash, block.timestamp + 7 days, 0);

        vm.startPrank(payer);
        usdc.approve(address(escrow), AMOUNT);
        escrow.fund(dealId);
        vm.stopPrank();
    }

    function testFullFlowFullPayout() public {
        uint256 dealId = _createAndFund();

        vm.prank(provider);
        escrow.submitEvidence(dealId, evidenceHash);

        vm.prank(aiOracle);
        escrow.proposeRuling(dealId, 10_000, rulingHash);

        vm.warp(block.timestamp + VETO_WINDOW + 1);
        escrow.settle(dealId);

        assertEq(usdc.balanceOf(provider), AMOUNT);
        assertEq(usdc.balanceOf(payer), 9 * AMOUNT);
        (,,,,,,,,,, ServiceDealEscrow.State st) = escrow.deals(dealId);
        assertEq(uint256(st), uint256(ServiceDealEscrow.State.Settled));
    }

    function testPartialPayout() public {
        uint256 dealId = _createAndFund();

        vm.prank(provider);
        escrow.submitEvidence(dealId, evidenceHash);

        vm.prank(aiOracle);
        escrow.proposeRuling(dealId, 6500, rulingHash);

        vm.warp(block.timestamp + VETO_WINDOW + 1);
        escrow.settle(dealId);

        assertEq(usdc.balanceOf(provider), (AMOUNT * 6500) / 10_000);
        assertEq(usdc.balanceOf(payer), 9 * AMOUNT + AMOUNT - ((AMOUNT * 6500) / 10_000));
    }

    function testCouncilOverride() public {
        uint256 dealId = _createAndFund();

        vm.prank(provider);
        escrow.submitEvidence(dealId, evidenceHash);

        vm.prank(aiOracle);
        escrow.proposeRuling(dealId, 10_000, rulingHash);

        bytes32 overrideHash = keccak256("override-ruling");
        vm.prank(council);
        escrow.overrideRuling(dealId, 3000, overrideHash);

        vm.warp(block.timestamp + VETO_WINDOW + 1);
        escrow.settle(dealId);

        assertEq(usdc.balanceOf(provider), (AMOUNT * 3000) / 10_000);
    }

    function testRefundIfExpired() public {
        uint256 dealId = _createAndFund();

        vm.warp(block.timestamp + 7 days + GRACE + 1);
        escrow.refundIfExpired(dealId);

        assertEq(usdc.balanceOf(payer), 10 * AMOUNT);
        assertEq(usdc.balanceOf(address(escrow)), 0);
    }

    function testCannotSettleBeforeVetoWindow() public {
        uint256 dealId = _createAndFund();

        vm.prank(provider);
        escrow.submitEvidence(dealId, evidenceHash);

        vm.prank(aiOracle);
        escrow.proposeRuling(dealId, 5000, rulingHash);

        vm.expectRevert(ServiceDealEscrow.TooEarlyToSettle.selector);
        escrow.settle(dealId);
    }

    function testCancelOpen() public {
        vm.prank(payer);
        uint256 dealId = escrow.createDeal(provider, AMOUNT, metadataHash, block.timestamp + 7 days, 0);

        vm.prank(payer);
        escrow.cancelOpen(dealId);

        (,,,,,,,,,, ServiceDealEscrow.State st) = escrow.deals(dealId);
        assertEq(uint256(st), uint256(ServiceDealEscrow.State.Cancelled));
    }
}
