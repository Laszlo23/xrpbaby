// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {OgStaking} from "../src/staking/OgStaking.sol";

contract OgStakingTest is Test {
    OgStaking internal staking;
    address internal admin = address(0xA11);
    address internal alice = address(0xA12);
    uint256 internal constant COOLDOWN = 3 days;

    function setUp() public {
        staking = new OgStaking(admin, COOLDOWN);
        vm.deal(alice, 1000 ether);
        vm.deal(admin, 1000 ether);
    }

    function testStakeAndNotify() public {
        vm.prank(alice);
        staking.stake{value: 10 ether}();

        assertEq(staking.balanceOf(alice), 10 ether);
        assertEq(staking.totalStaked(), 10 ether);

        vm.prank(admin);
        staking.notifyRewardAmount{value: 7 ether}(7 days);

        assertGt(staking.rewardRate(), 0);
    }

    function testEarnAndClaim() public {
        vm.startPrank(alice);
        staking.stake{value: 10 ether}();
        vm.stopPrank();

        vm.prank(admin);
        staking.notifyRewardAmount{value: 7 ether}(7 days);

        vm.warp(block.timestamp + 1 days);

        uint256 e = staking.earned(alice);
        assertGt(e, 0);

        vm.prank(alice);
        staking.getReward();

        assertGt(alice.balance, 1000 ether - 10 ether);
    }

    function testCooldownUnstake() public {
        vm.prank(alice);
        staking.stake{value: 10 ether}();

        vm.prank(alice);
        staking.requestUnstake(10 ether);

        assertEq(staking.balanceOf(alice), 0);
        assertEq(staking.pendingWithdraw(alice), 10 ether);

        vm.prank(alice);
        vm.expectRevert(OgStaking.StillLocked.selector);
        staking.completeUnstake();

        vm.warp(block.timestamp + COOLDOWN);

        uint256 balBefore = alice.balance;
        vm.prank(alice);
        staking.completeUnstake();
        assertEq(alice.balance, balBefore + 10 ether);
    }

    function testDoubleRequestReverts() public {
        vm.prank(alice);
        staking.stake{value: 10 ether}();

        vm.prank(alice);
        staking.requestUnstake(5 ether);

        vm.prank(alice);
        vm.expectRevert(OgStaking.PendingUnstake.selector);
        staking.requestUnstake(5 ether);
    }
}
