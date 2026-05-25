// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CulturePulseAnchor} from "../src/CulturePulseAnchor.sol";

contract CulturePulseAnchorTest is Test {
    CulturePulseAnchor internal anchor;
    address internal owner = address(this);
    address internal alice = address(0xA11CE);

    function setUp() public {
        anchor = new CulturePulseAnchor(owner);
    }

    function testAttestDay() public {
        bytes32 digest = keccak256("metrics");
        anchor.attestDay(20260523, digest, "https://app.example/api/pulse/digest/2026-05-23");
        assertEq(anchor.dayDigest(20260523), digest);
    }

    function testOnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        anchor.attestDay(1, bytes32(uint256(1)), "uri");
    }

    function testZeroDigestReverts() public {
        vm.expectRevert(bytes("digest"));
        anchor.attestDay(1, bytes32(0), "uri");
    }
}
