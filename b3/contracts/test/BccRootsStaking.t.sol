// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {BccRootsStaking} from "../src/bcc/BccRootsStaking.sol";

contract MockBcc is ERC20 {
    constructor() ERC20("Mock BCC", "BCC") {
        _mint(msg.sender, 1_000_000 ether);
    }
}

contract BccRootsStakingTest is Test {
    MockBcc internal token;
    BccRootsStaking internal staking;
    address internal alice = address(0xA11CE);
    address internal treasury = address(0x7EA5);

    uint256 internal constant COOLDOWN = 7 days;

    function setUp() public {
        token = new MockBcc();
        string[3] memory names = ["Seedling", "Builder Grove", "Elder Canopy"];
        uint256[3] memory locks = [uint256(30 days), uint256(90 days), uint256(180 days)];
        uint256[3] memory weights = [uint256(10_000), uint256(13_000), uint256(15_000)];
        staking = new BccRootsStaking(address(this), token, COOLDOWN, names, locks, weights);
        staking.grantRole(staking.REWARD_ROLE(), treasury);

        token.transfer(alice, 10_000 ether);
        token.transfer(treasury, 100_000 ether);
    }

    function testStakeAndNotifyRewards() public {
        vm.startPrank(alice);
        token.approve(address(staking), 1_000 ether);
        staking.stake(0, 1_000 ether);
        vm.stopPrank();

        (uint256 raw, uint256 weighted) = staking.totalStaked(0);
        assertEq(raw, 1_000 ether);
        assertEq(weighted, 1_000 ether);

        vm.startPrank(treasury);
        token.approve(address(staking), 100 ether);
        staking.notifyRewardAmount(0, 100 ether, 7 days);
        vm.stopPrank();

        vm.warp(block.timestamp + 3.5 days);

        uint256 earned = staking.earned(0, alice);
        assertGt(earned, 0);

        uint256 beforeClaim = token.balanceOf(alice);
        vm.prank(alice);
        staking.getReward(0);
        assertGt(token.balanceOf(alice), beforeClaim);
    }

    function testWeightedStakeTrackedInPoolTotals() public {
        address bob = address(0xB0B);
        token.transfer(bob, 10_000 ether);

        vm.startPrank(alice);
        token.approve(address(staking), 1_000 ether);
        staking.stake(0, 1_000 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        token.approve(address(staking), 1_000 ether);
        staking.stake(1, 1_000 ether);
        vm.stopPrank();

        (uint256 raw0, uint256 weighted0) = staking.totalStaked(0);
        (uint256 raw1, uint256 weighted1) = staking.totalStaked(1);
        assertEq(raw0, 1_000 ether);
        assertEq(weighted0, 1_000 ether);
        assertEq(raw1, 1_000 ether);
        assertEq(weighted1, 1_300 ether);
        assertEq(staking.weightedBalance(1, bob), 1_300 ether);
    }

    function testPrincipalLockBlocksEarlyUnstake() public {
        vm.startPrank(alice);
        token.approve(address(staking), 500 ether);
        staking.stake(0, 500 ether);

        vm.expectRevert(BccRootsStaking.PrincipalLocked.selector);
        staking.requestUnstake(0, 500 ether);
        vm.stopPrank();
    }

    function testUnstakeAfterLockAndCooldown() public {
        vm.startPrank(alice);
        token.approve(address(staking), 500 ether);
        staking.stake(0, 500 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 30 days);

        vm.prank(alice);
        staking.requestUnstake(0, 500 ether);

        vm.expectRevert(BccRootsStaking.StillLocked.selector);
        vm.prank(alice);
        staking.completeUnstake(0);

        vm.warp(block.timestamp + COOLDOWN);

        uint256 before = token.balanceOf(alice);
        vm.prank(alice);
        staking.completeUnstake(0);
        assertEq(token.balanceOf(alice), before + 500 ether);
    }

    function testPauseBlocksStake() public {
        staking.pause();
        vm.startPrank(alice);
        token.approve(address(staking), 100 ether);
        vm.expectRevert();
        staking.stake(0, 100 ether);
        vm.stopPrank();
    }
}
