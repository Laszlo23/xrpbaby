// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BuildingCultureDollar} from "../src/BuildingCultureDollar.sol";
import {BCDGenesisClaim} from "../src/BCDGenesisClaim.sol";

contract BCDGenesisClaimTest is Test {
    address internal owner = address(this);
    address internal treasury = address(0xBEEF);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    uint256 internal constant CAP = 1_000_000 ether;
    uint256 internal constant AMT_A = 100 ether;
    uint256 internal constant AMT_B = 200 ether;

    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    function _deployPair(bytes32 root, uint256 feeWei, uint256 endsAt_)
        internal
        returns (BuildingCultureDollar t, BCDGenesisClaim c)
    {
        t = new BuildingCultureDollar(owner, CAP);
        c = new BCDGenesisClaim(owner, address(t), treasury, root, feeWei, endsAt_);
        t.setGenesisClaimContract(address(c));
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function setUp() public {
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testClaimTwoAccounts() public {
        bytes32 leafA = keccak256(abi.encode(alice, AMT_A));
        bytes32 leafB = keccak256(abi.encode(bob, AMT_B));
        bytes32 root = _hashPair(leafA, leafB);

        (BuildingCultureDollar token, BCDGenesisClaim genesis) = _deployPair(root, 0, 0);

        vm.prank(alice);
        bytes32[] memory proofA = new bytes32[](1);
        proofA[0] = leafB;
        genesis.claim(AMT_A, proofA);

        vm.prank(bob);
        bytes32[] memory proofB = new bytes32[](1);
        proofB[0] = leafA;
        genesis.claim(AMT_B, proofB);

        assertEq(token.balanceOf(alice), AMT_A);
        assertEq(token.balanceOf(bob), AMT_B);
    }

    function testDoubleClaim_revertsClaimed() public {
        bytes32 leafA = keccak256(abi.encode(alice, AMT_A));
        bytes32 leafB = keccak256(abi.encode(bob, AMT_B));
        bytes32 root = _hashPair(leafA, leafB);

        (, BCDGenesisClaim genesis) = _deployPair(root, 0, 0);

        vm.startPrank(alice);
        bytes32[] memory proofA = new bytes32[](1);
        proofA[0] = leafB;
        genesis.claim(AMT_A, proofA);
        vm.expectRevert(bytes("claimed"));
        genesis.claim(AMT_A, proofA);
        vm.stopPrank();
    }

    function testClaimWithFeeRoutesToTreasury() public {
        bytes32 leafA = keccak256(abi.encode(alice, AMT_A));
        bytes32 leafB = keccak256(abi.encode(bob, AMT_B));
        bytes32 root = _hashPair(leafA, leafB);

        (BuildingCultureDollar token, BCDGenesisClaim genesis) = _deployPair(root, 0.01 ether, 0);

        bytes32[] memory proofA = new bytes32[](1);
        proofA[0] = leafB;

        uint256 treasuryBefore = treasury.balance;

        vm.prank(alice);
        genesis.claim{value: 0.01 ether}(AMT_A, proofA);

        assertEq(treasury.balance - treasuryBefore, 0.01 ether);
        assertEq(token.balanceOf(alice), AMT_A);
    }

    function testWrongFeeReverts() public {
        bytes32 leafA = keccak256(abi.encode(alice, AMT_A));
        bytes32 leafB = keccak256(abi.encode(bob, AMT_B));
        bytes32 root = _hashPair(leafA, leafB);

        (, BCDGenesisClaim genesis) = _deployPair(root, 0.01 ether, 0);

        bytes32[] memory proofA = new bytes32[](1);
        proofA[0] = leafB;

        vm.prank(alice);
        vm.expectRevert(bytes("fee"));
        genesis.claim{value: 0}(AMT_A, proofA);
    }

    function testInvalidProofReverts() public {
        bytes32 leafA = keccak256(abi.encode(alice, AMT_A));
        bytes32 leafB = keccak256(abi.encode(bob, AMT_B));
        bytes32 root = _hashPair(leafA, leafB);

        (, BCDGenesisClaim genesis) = _deployPair(root, 0, 0);

        vm.prank(alice);
        bytes32[] memory badProof = new bytes32[](1);
        badProof[0] = bytes32(uint256(999));
        vm.expectRevert(bytes("proof"));
        genesis.claim(AMT_A, badProof);
    }

    function testPausedReverts() public {
        bytes32 leafA = keccak256(abi.encode(alice, AMT_A));
        bytes32 leafB = keccak256(abi.encode(bob, AMT_B));
        bytes32 root = _hashPair(leafA, leafB);

        (, BCDGenesisClaim genesis) = _deployPair(root, 0, 0);
        genesis.pause();

        vm.prank(alice);
        bytes32[] memory proofA = new bytes32[](1);
        proofA[0] = leafB;
        vm.expectRevert();
        genesis.claim(AMT_A, proofA);
    }
}
