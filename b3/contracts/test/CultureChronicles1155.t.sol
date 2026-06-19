// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CultureChronicles1155} from "../src/CultureChronicles1155.sol";

contract CultureChronicles1155Test is Test {
    CultureChronicles1155 public chronicles;
    address public treasury = address(0xBEEF);
    address public alice = address(0xA11CE);

    function setUp() public {
        vm.warp(1_700_000_000);
        chronicles = new CultureChronicles1155(
            treasury,
            block.timestamp + 48 hours,
            "https://example.com/chronicles/metadata/",
            alice
        );
        vm.deal(alice, 100 ether);
        vm.deal(address(this), 100 ether);
    }

    function testMint_chapter1_launch_price() public {
        uint256 price = chronicles.editionPriceWeiActive(1);
        assertEq(price, 0.00019 ether);

        uint256 before = treasury.balance;
        vm.prank(alice);
        chronicles.mint{value: price}(1, 1);
        assertEq(treasury.balance - before, price);
        assertEq(chronicles.balanceOf(alice, 1), 1);
        assertEq(chronicles.editionMinted(1), 1);
    }

    function testMint_requires_prior_edition() public {
        vm.prank(alice);
        vm.expectRevert(bytes("prior"));
        chronicles.mint{value: 0.00019 ether}(2, 1);
    }

    function testMint_skip_key_bypasses_prior() public {
        vm.prank(alice);
        chronicles.buySkipKey{value: 0.00055 ether}();
        vm.prank(alice);
        chronicles.mint{value: 0.00019 ether}(2, 1);
        assertEq(chronicles.balanceOf(alice, 2), 1);
    }

    function testMint_after_prior() public {
        vm.startPrank(alice);
        chronicles.mint{value: 0.00019 ether}(1, 1);
        chronicles.mint{value: 0.00019 ether}(2, 1);
        vm.stopPrank();
        assertEq(chronicles.balanceOf(alice, 2), 1);
    }

    function testUri_suffix_json() public view {
        assertEq(chronicles.uri(1), "https://example.com/chronicles/metadata/1.json");
    }

    function testRevert_wrong_payment() public {
        vm.prank(alice);
        vm.expectRevert(bytes("payment"));
        chronicles.mint{value: 0.00018 ether}(1, 1);
    }

    function testLaunch_price_expires() public {
        vm.warp(block.timestamp + 49 hours);
        assertEq(chronicles.editionPriceWeiActive(1), 0.00028 ether);
    }
}
