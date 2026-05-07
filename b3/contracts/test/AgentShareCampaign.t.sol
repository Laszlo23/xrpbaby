// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentShareCampaign} from "../src/AgentShareCampaign.sol";

contract AgentShareCampaignTest is Test {
    AgentShareCampaign internal c;
    address internal treasury;
    address internal vault;
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        treasury = makeAddr("treasury");
        vault = makeAddr("vault");
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        c = new AgentShareCampaign(
            "Agent Shares",
            "AGNT",
            0.01 ether,
            100,
            treasury,
            vault,
            500, // 5% liquidity
            500, // 5% referrer
            "https://meta.example/",
            address(this)
        );
    }

    function testMintSplitsFeesWithReferrer() public {
        uint256 price = c.mintPriceWei();
        vm.prank(alice);
        c.mint{value: price}(1, bob);

        assertEq(c.ownerOf(1), alice);
        assertEq(c.agentTypeOf(1), 1);
        assertEq(c.referralClaimable(bob), (price * 500) / 10_000);
        assertEq(treasury.balance, price - (price * 500) / 10_000 - (price * 500) / 10_000);
        assertEq(vault.balance, (price * 500) / 10_000);
    }

    function testReferrerWithdraw() public {
        uint256 price = c.mintPriceWei();
        vm.prank(alice);
        c.mint{value: price}(0, bob);

        uint256 owed = c.referralClaimable(bob);
        vm.prank(bob);
        c.withdrawReferral();
        assertEq(bob.balance, 10 ether + owed);
        assertEq(c.referralClaimable(bob), 0);
    }

    function testRevertsSelfReferrer() public {
        uint256 price = c.mintPriceWei();
        vm.prank(alice);
        vm.expectRevert(AgentShareCampaign.InvalidReferrer.selector);
        c.mint{value: price}(1, alice);
    }

    function testDailyCap() public {
        uint256 price = c.mintPriceWei();
        for (uint256 i = 0; i < 100; i++) {
            vm.deal(address(uint160(0x1000 + i)), price);
            vm.prank(address(uint160(0x1000 + i)));
            c.mint{value: price}(0, address(0));
        }
        vm.deal(alice, price);
        vm.prank(alice);
        vm.expectRevert(AgentShareCampaign.DailyCap.selector);
        c.mint{value: price}(0, address(0));
    }
}
