// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";
import {IPropertyShareToken} from "../src/interfaces/IPropertyShareToken.sol";

contract PropertyShareFactoryTest is Test {
    PropertyRegistry internal registry;
    ComplianceRegistry internal compliance;
    PropertyShareFactory internal factory;

    address internal admin = address(0xA11);
    address internal registrar = address(0xB22);
    address internal owner = address(0xC33);

    bytes32 internal constant REF = keccak256("parcel-1");

    function setUp() public {
        registry = new PropertyRegistry(admin);
        bytes32 regRole = registry.REGISTRAR_ROLE();
        vm.startPrank(admin);
        registry.grantRole(regRole, registrar);
        vm.stopPrank();

        vm.prank(registrar);
        uint256 pid = registry.registerProperty(REF, bytes32(0), owner);

        compliance = new ComplianceRegistry(admin);
        vm.startPrank(admin);
        compliance.setWalletStatus(owner, IComplianceRegistry.Status.Verified);
        vm.stopPrank();

        factory = new PropertyShareFactory(address(registry), address(compliance), admin);
        bytes32 fr = factory.REGISTRAR_ROLE();
        vm.prank(admin);
        factory.grantRole(fr, registrar);

        assertEq(pid, 1);
    }

    function testCreateByRegistrar() public {
        vm.prank(registrar);
        address t = factory.createPropertyShare(
            1, "Prop Shares", "PS1", "https://meta", 1_000_000 ether, owner, 1000 ether, owner
        );
        assertEq(IPropertyShareToken(t).propertyId(), 1);
        assertEq(IPropertyShareToken(t).balanceOf(owner), 1000 ether);
        assertEq(factory.tokenByPropertyId(1), t);
    }

    function testCreateByRecordOwner() public {
        bytes32 ref2 = keccak256("parcel-2");
        vm.prank(registrar);
        uint256 pid2 = registry.registerProperty(ref2, bytes32(0), owner);

        vm.prank(admin);
        compliance.setWalletStatus(owner, IComplianceRegistry.Status.Verified);

        vm.prank(owner);
        address t = factory.createPropertyShare(
            pid2, "Prop2", "PS2", "https://meta/2", 0, owner, 0, address(0)
        );
        assertEq(factory.tokenByPropertyId(pid2), t);
    }
}
