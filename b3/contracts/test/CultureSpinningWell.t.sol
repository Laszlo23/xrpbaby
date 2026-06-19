// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CultureSpinningWell} from "../src/CultureSpinningWell.sol";

contract CultureSpinningWellTest is Test {
    CultureSpinningWell internal well;

    function setUp() public {
        vm.warp(86_400 * 20_000);
        well = new CultureSpinningWell();
    }

    function test_spin_emits_and_records() public {
        uint256 day = block.timestamp / 1 days;
        vm.expectEmit(true, false, false, true);
        emit CultureSpinningWell.WellSpun(address(this), day, 24);
        well.spin(24);
        assertEq(well.lastSpinDay(address(this)), day);
    }

    function test_spin_once_per_day() public {
        well.spin(10);
        vm.expectRevert(CultureSpinningWell.CultureSpinningWell__AlreadySpun.selector);
        well.spin(33);
    }

    function test_new_day_allows_again() public {
        well.spin(5);
        vm.warp(block.timestamp + 1 days);
        well.spin(7);
        assertEq(well.lastSpinDay(address(this)), block.timestamp / 1 days);
    }

    function test_rejects_zero_and_34() public {
        vm.expectRevert(CultureSpinningWell.CultureSpinningWell__InvalidValue.selector);
        well.spin(0);
        vm.expectRevert(CultureSpinningWell.CultureSpinningWell__InvalidValue.selector);
        well.spin(34);
    }
}
