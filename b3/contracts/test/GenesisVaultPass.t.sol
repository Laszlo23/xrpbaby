// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {GenesisVaultPass} from "../src/GenesisVaultPass.sol";

contract GenesisVaultPassTest is Test {
    GenesisVaultPass public pass;
    address public treasury = address(0xBEEF);
    address public alice = address(0xA11CE);

    uint256 constant PRICE = 0.01 ether;
    uint256 constant MAX = 100;

    function setUp() public {
        vm.prank(alice);
        pass = new GenesisVaultPass(
            "Genesis Vault Pass P0",
            "GVP0",
            PRICE,
            MAX,
            treasury,
            "https://example.com/meta/tier0/",
            alice
        );
        vm.deal(alice, 100 ether);
        vm.deal(address(this), 100 ether);
    }

    function testMint_forwards_eth_to_treasury() public {
        uint256 before = treasury.balance;
        vm.prank(alice);
        pass.mint{value: PRICE * 2}(2);
        assertEq(treasury.balance - before, PRICE * 2);
        assertEq(pass.balanceOf(alice), 2);
        assertEq(pass.totalSupply(), 2);
    }

    function testTokenURI_suffix_json() public {
        vm.prank(alice);
        pass.mint{value: PRICE}(1);
        assertEq(pass.tokenURI(1), "https://example.com/meta/tier0/1.json");
    }

    function testRevert_wrong_payment() public {
        vm.prank(alice);
        vm.expectRevert(bytes("payment"));
        pass.mint{value: PRICE - 1}(1);
    }
}
