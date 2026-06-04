// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract DailyCheckInTest is Test {
    DailyCheckIn internal c;

    function setUp() public {
        vm.warp(86400 * 20_000);
        c = new DailyCheckIn();
    }

    function test_checkIn_once_per_day() public {
        uint256 day = block.timestamp / 1 days;
        c.checkIn();
        assertEq(c.lastCheckInDay(address(this)), day);
        vm.expectRevert(DailyCheckIn.DailyCheckIn__AlreadyCheckedIn.selector);
        c.checkIn();
    }

    function test_new_day_allows_again() public {
        c.checkIn();
        vm.warp(block.timestamp + 1 days);
        c.checkIn();
        assertEq(c.lastCheckInDay(address(this)), block.timestamp / 1 days);
    }
}
