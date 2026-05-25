// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BuildingCultureDollar} from "../src/BuildingCultureDollar.sol";

contract BuildingCultureDollarTest is Test {
    address internal owner = address(this);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal genesis = address(0xC1A111);
    address internal sale = address(0x5A1E000);

    uint256 internal constant CAP = 1_000_000 ether;

    function testCapEnforced() public {
        BuildingCultureDollar token = new BuildingCultureDollar(owner, CAP);
        vm.expectRevert();
        token.ownerMint(alice, CAP + 1);
    }

    function testOnlyGenesisCanGenesisMint() public {
        BuildingCultureDollar token = new BuildingCultureDollar(owner, CAP);
        token.setGenesisClaimContract(genesis);

        vm.prank(bob);
        vm.expectRevert(bytes("only genesis"));
        token.genesisMint(alice, 1 ether);

        vm.prank(genesis);
        token.genesisMint(alice, 100 ether);
        assertEq(token.balanceOf(alice), 100 ether);
    }

    function testOnlySaleCanSaleMint() public {
        BuildingCultureDollar token = new BuildingCultureDollar(owner, CAP);
        token.setFixedSaleContract(sale);

        vm.prank(bob);
        vm.expectRevert(bytes("only sale"));
        token.saleMint(alice, 1 ether);

        vm.prank(sale);
        token.saleMint(alice, 50 ether);
        assertEq(token.balanceOf(alice), 50 ether);
    }

    function testGenesisContractSetOnce() public {
        BuildingCultureDollar token = new BuildingCultureDollar(owner, CAP);
        token.setGenesisClaimContract(genesis);
        vm.expectRevert(bytes("genesis set"));
        token.setGenesisClaimContract(bob);
    }

    function testOwnerMintDisabledForever() public {
        BuildingCultureDollar token = new BuildingCultureDollar(owner, CAP);
        token.ownerMint(alice, 1 ether);
        token.disableOwnerMintForever();
        vm.expectRevert(bytes("owner mint off"));
        token.ownerMint(alice, 1 ether);
        vm.expectRevert(bytes("already"));
        token.disableOwnerMintForever();
    }

    function testUnauthorizedOwnerMint() public {
        BuildingCultureDollar token = new BuildingCultureDollar(owner, CAP);
        vm.prank(alice);
        vm.expectRevert();
        token.ownerMint(alice, 1 ether);
    }
}
