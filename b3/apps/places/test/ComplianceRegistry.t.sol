// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";

contract ComplianceRegistryTest is Test {
    ComplianceRegistry internal reg;
    address internal admin = address(0xA11);
    address internal alice = address(0xA);

    function setUp() public {
        reg = new ComplianceRegistry(admin);
    }

    function testAdminCanVerify() public {
        vm.prank(admin);
        reg.setWalletStatus(alice, IComplianceRegistry.Status.Verified);
        assertTrue(reg.isVerified(alice));
        assertEq(uint256(reg.statusOf(alice)), uint256(IComplianceRegistry.Status.Verified));
    }

    function testSystemContract() public {
        address pair = address(0x1234);
        vm.prank(admin);
        reg.setSystemContract(pair, true);
        assertTrue(reg.isSystemContract(pair));
    }

    function testKycBypassMakesEveryoneVerified() public {
        assertFalse(reg.isVerified(alice));
        vm.prank(admin);
        reg.setKycBypass(true);
        assertTrue(reg.kycBypass());
        assertTrue(reg.isVerified(alice));
        vm.prank(admin);
        reg.setKycBypass(false);
        assertFalse(reg.isVerified(alice));
    }

    function testVerifiedStillWorksWhenBypassOff() public {
        vm.prank(admin);
        reg.setWalletStatus(alice, IComplianceRegistry.Status.Verified);
        assertTrue(reg.isVerified(alice));
    }
}
