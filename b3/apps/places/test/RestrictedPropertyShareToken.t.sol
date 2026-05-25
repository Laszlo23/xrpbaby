// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {RestrictedPropertyShareToken} from "../src/RestrictedPropertyShareToken.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";

contract RestrictedPropertyShareTokenTest is Test {
    PropertyRegistry internal registry;
    ComplianceRegistry internal compliance;
    RestrictedPropertyShareToken internal token;

    address internal admin = address(0xA11);
    address internal registrar = address(0xB22);
    address internal owner = address(0xC33);
    address internal alice = address(0xA);

    bytes32 internal constant REF = keccak256("parcel-r");

    function setUp() public {
        registry = new PropertyRegistry(admin);
        bytes32 registrarRole = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(registrarRole, registrar);

        vm.prank(registrar);
        uint256 pid = registry.registerProperty(REF, bytes32(0), owner);

        compliance = new ComplianceRegistry(admin);
        vm.prank(admin);
        compliance.setWalletStatus(owner, IComplianceRegistry.Status.Verified);
        vm.prank(admin);
        compliance.setWalletStatus(alice, IComplianceRegistry.Status.Verified);

        token = new RestrictedPropertyShareToken(
            "Restricted",
            "RST",
            pid,
            address(registry),
            "https://meta",
            1_000_000 ether,
            admin,
            1000 ether,
            owner,
            compliance
        );
        assertEq(token.balanceOf(owner), 1000 ether);
    }

    function testVerifiedTransfer() public {
        vm.prank(owner);
        token.transfer(alice, 100 ether);
        assertEq(token.balanceOf(alice), 100 ether);
    }

    function testRevertUnverifiedRecipient() public {
        address bob = address(0xB0B);
        vm.prank(owner);
        vm.expectRevert(RestrictedPropertyShareToken.NotCompliant.selector);
        token.transfer(bob, 1 ether);
    }
}
