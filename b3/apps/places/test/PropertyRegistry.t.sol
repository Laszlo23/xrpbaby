// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";

contract PropertyRegistryTest is Test {
    PropertyRegistry internal registry;
    address internal admin = address(0xA11);
    address internal registrar = address(0xB22);
    address internal owner = address(0xC33);

    bytes32 internal constant REF = keccak256("US-CA-FAKE-APN-123");
    bytes32 internal constant META = keccak256("ipfs-like-metadata");

    function setUp() public {
        registry = new PropertyRegistry(admin);
        bytes32 regRole = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(regRole, registrar);
    }

    function testRegisterAndAnchor() public {
        vm.prank(registrar);
        uint256 pid = registry.registerProperty(REF, META, owner);
        assertEq(pid, 1);

        assertTrue(registry.propertyExists(pid));
        bytes32 docKind = keccak256("DEED");
        bytes32 root = keccak256("0g-storage-root");
        vm.prank(registrar);
        registry.addDocument(pid, docKind, root);
        assertEq(registry.getDocumentRoot(pid, docKind), root);
    }

    function testDuplicateRefReverts() public {
        vm.startPrank(registrar);
        registry.registerProperty(REF, META, owner);
        vm.expectRevert(PropertyRegistry.DuplicateExternalRef.selector);
        registry.registerProperty(REF, META, owner);
        vm.stopPrank();
    }

    function testTransferRecord() public {
        vm.prank(registrar);
        uint256 pid = registry.registerProperty(REF, META, owner);
        address newOwner = address(0xD44);
        vm.prank(owner);
        registry.transferRecord(pid, newOwner);
        assertEq(registry.getProperty(pid).recordOwner, newOwner);
    }
}
