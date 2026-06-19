// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PanicSwitchAttestation} from "../src/PanicSwitchAttestation.sol";

contract PanicSwitchAttestationTest is Test {
    PanicSwitchAttestation internal c;
    address internal alice = address(0xA11CE);

    function setUp() public {
        vm.warp(86400 * 20_000);
        c = new PanicSwitchAttestation();
    }

    function test_attest_once_per_day() public {
        vm.prank(alice);
        c.attest(640, 3600);
        assertEq(c.lastAttestDay(alice), c.currentDayIndex());
        assertEq(c.streakDays(alice), 1);
        assertEq(c.totalRuns(alice), 1);
        assertTrue(c.firstAttestAt(alice) > 0);

        vm.prank(alice);
        vm.expectRevert(PanicSwitchAttestation.PanicSwitchAttestation__AlreadyAttestedToday.selector);
        c.attest(700, 4000);
    }

    function test_streak_increments_on_consecutive_days() public {
        vm.prank(alice);
        c.attest(500, 100);
        vm.warp(block.timestamp + 1 days);
        vm.prank(alice);
        c.attest(600, 200);
        assertEq(c.streakDays(alice), 2);
        assertEq(c.totalRuns(alice), 2);
    }

    function test_streak_resets_after_gap() public {
        vm.prank(alice);
        c.attest(500, 100);
        vm.warp(block.timestamp + 2 days);
        vm.prank(alice);
        c.attest(600, 200);
        assertEq(c.streakDays(alice), 1);
    }

    function test_rejects_invalid_precision() public {
        vm.prank(alice);
        vm.expectRevert(PanicSwitchAttestation.PanicSwitchAttestation__InvalidPrecision.selector);
        c.attest(800, 100);
    }
}
