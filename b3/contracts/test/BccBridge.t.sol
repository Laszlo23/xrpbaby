// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {WrappedBCC} from "../src/bcc/WrappedBCC.sol";
import {BccBridgeVault} from "../src/bcc/BccBridgeVault.sol";

contract MockCanonicalBcc is ERC20 {
    constructor() ERC20("Building Culture Capital", "BCC") {
        _mint(msg.sender, 10_000_000 ether);
    }
}

contract BccBridgeTest is Test {
    MockCanonicalBcc internal bcc;
    BccBridgeVault internal vault;
    WrappedBCC internal wBcc;

    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal relayer = address(0xBEEF);

    uint256 internal constant BSC_CHAIN_ID = 56;

    function setUp() public {
        bcc = new MockCanonicalBcc();
        vault = new BccBridgeVault(address(bcc), BSC_CHAIN_ID, address(this));
        wBcc = new WrappedBCC(address(bcc), address(this));

        vault.setBridge(relayer);
        wBcc.setBridge(relayer);

        bcc.transfer(alice, 1000 ether);
        bcc.transfer(bob, 1000 ether);
    }

    function testLockMintUnlockBurnRoundTrip() public {
        uint256 amount = 100 ether;

        vm.startPrank(alice);
        bcc.approve(address(vault), amount);
        vault.lock(bob, amount, BSC_CHAIN_ID);
        vm.stopPrank();

        assertEq(vault.lockedBalance(), amount);
        assertEq(vault.totalLocked(), amount);

        vm.startPrank(relayer);
        wBcc.bridgeMint(bob, amount, 1);
        vm.stopPrank();

        assertEq(wBcc.balanceOf(bob), amount);
        assertEq(wBcc.totalSupply(), amount);

        vm.startPrank(bob);
        wBcc.bridgeBurn(amount, 8453);
        vm.stopPrank();

        assertEq(wBcc.balanceOf(bob), 0);

        vm.startPrank(relayer);
        vault.registerBurn(bob, amount, BSC_CHAIN_ID, 1);
        vault.unlock(bob, amount, BSC_CHAIN_ID, 1);
        vm.stopPrank();

        assertEq(bcc.balanceOf(bob), 1000 ether + amount);
        assertEq(vault.lockedBalance(), 0);
    }

    function testCannotUnlockWithoutBurn() public {
        vm.startPrank(alice);
        bcc.approve(address(vault), 50 ether);
        vault.lock(alice, 50 ether, BSC_CHAIN_ID);
        vm.stopPrank();

        vm.prank(relayer);
        vm.expectRevert("BccBridgeVault: no burn");
        vault.unlock(alice, 50 ether, BSC_CHAIN_ID, 999);
    }

    function testReplayProtection() public {
        vm.startPrank(alice);
        bcc.approve(address(vault), 50 ether);
        vault.lock(alice, 50 ether, BSC_CHAIN_ID);
        vm.stopPrank();

        vm.startPrank(relayer);
        wBcc.bridgeMint(alice, 50 ether, 1);
        vault.registerBurn(alice, 50 ether, BSC_CHAIN_ID, 1);
        vault.unlock(alice, 50 ether, BSC_CHAIN_ID, 1);

        vm.expectRevert("BccBridgeVault: replay");
        vault.unlock(alice, 1 ether, BSC_CHAIN_ID, 1);
        vm.stopPrank();
    }

    function testPauseBlocksLock() public {
        vault.pause();
        vm.startPrank(alice);
        bcc.approve(address(vault), 1 ether);
        vm.expectRevert();
        vault.lock(alice, 1 ether, BSC_CHAIN_ID);
        vm.stopPrank();
    }

    function testOnlyBridgeCanMint() public {
        vm.expectRevert();
        wBcc.bridgeMint(alice, 1 ether, 1);
    }

    function testSupplyInvariantAfterPartialFlow() public {
        uint256 lockAmount = 200 ether;
        vm.startPrank(alice);
        bcc.approve(address(vault), lockAmount);
        vault.lock(bob, lockAmount, BSC_CHAIN_ID);
        vm.stopPrank();

        uint256 nonce = vault.lockNonce();
        vm.prank(relayer);
        wBcc.bridgeMint(bob, lockAmount, nonce);

        assertEq(vault.lockedBalance(), lockAmount);
        assertEq(wBcc.totalSupply(), lockAmount);
    }
}
