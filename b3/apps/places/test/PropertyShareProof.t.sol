// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";
import {PropertyShareProof} from "../src/PropertyShareProof.sol";
import {IPropertyShareFactoryMinimal} from "../src/interfaces/IPropertyShareFactoryMinimal.sol";

contract PropertyShareProofTest is Test {
    PropertyRegistry internal registry;
    ComplianceRegistry internal compliance;
    PropertyShareFactory internal factory;
    PropertyShareProof internal proof;

    address internal admin = address(0xA11);
    address internal registrar = address(0xB22);
    address internal owner = address(0xC33);
    address internal buyer = address(0xD44);

    bytes32 internal constant REF = keccak256("parcel-nft");

    function setUp() public {
        registry = new PropertyRegistry(admin);
        bytes32 rr = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(rr, registrar);

        vm.prank(registrar);
        uint256 pid = registry.registerProperty(REF, bytes32(0), owner);

        compliance = new ComplianceRegistry(admin);
        vm.startPrank(admin);
        compliance.setWalletStatus(owner, IComplianceRegistry.Status.Verified);
        compliance.setWalletStatus(buyer, IComplianceRegistry.Status.Verified);
        vm.stopPrank();

        factory = new PropertyShareFactory(address(registry), address(compliance), admin);
        bytes32 fr = factory.REGISTRAR_ROLE();
        vm.prank(admin);
        factory.grantRole(fr, registrar);

        vm.prank(registrar);
        address tokenAddr = factory.createPropertyShare(
            pid, "Test Share", "TS", "https://m", 1_000_000 ether, owner, 100 ether, owner
        );

        vm.prank(owner);
        IERC20(tokenAddr).transfer(buyer, 10 ether);

        proof = new PropertyShareProof(
            admin,
            compliance,
            IPropertyShareFactoryMinimal(address(factory)),
            "Og Proof",
            "OG-CRT",
            "https://example.com/meta/"
        );
    }

    function testClaimMintsSoulbound() public {
        vm.prank(buyer);
        proof.claim(1);
        assertEq(proof.balanceOf(buyer), 1);
        assertEq(proof.ownerOf(1), buyer);

        vm.prank(buyer);
        vm.expectRevert(PropertyShareProof.NonTransferable.selector);
        proof.transferFrom(buyer, address(0xE11), 1);
    }

    function testDoubleClaimReverts() public {
        vm.startPrank(buyer);
        proof.claim(1);
        vm.expectRevert(PropertyShareProof.AlreadyClaimed.selector);
        proof.claim(1);
        vm.stopPrank();
    }

    function testUnverifiedCannotClaim() public {
        vm.prank(address(0xBAD));
        vm.expectRevert(PropertyShareProof.NotVerified.selector);
        proof.claim(1);
    }

    function testNoSharesCannotClaim() public {
        address richButNoShares = address(0xCAFE);
        vm.prank(admin);
        compliance.setWalletStatus(richButNoShares, IComplianceRegistry.Status.Verified);
        vm.prank(richButNoShares);
        vm.expectRevert(PropertyShareProof.NoShareBalance.selector);
        proof.claim(1);
    }
}
