// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CultureLayerIdentity} from "../src/CultureLayerIdentity.sol";

contract CultureLayerIdentityTest is Test {
    CultureLayerIdentity public nft;
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    // ~$1.11 USD at $3,000/ETH (see scripts/identity-mint-price-wei.mjs)
    uint256 constant PRICE = 370_000_000_000_000;

    function setUp() public {
        nft = new CultureLayerIdentity(address(this), PRICE);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function test_MintAndAvailability() public {
        assertTrue(nft.isAvailable("laszlo", 0));
        vm.prank(alice);
        uint256 id = nft.mint{value: PRICE}("laszlo", 0);
        assertEq(id, 1);
        assertFalse(nft.isAvailable("laszlo", 0));
        assertEq(nft.getTokenId("laszlo", 0), 1);
        assertEq(nft.ownerOf(1), alice);
    }

    function test_FoundingMember() public {
        vm.prank(alice);
        uint256 id = nft.mint{value: PRICE}("founder", 0);
        assertTrue(nft.isFoundingMember(id));
        (address owner_, string memory handle, uint8 tldId, uint64 mintedAt, bool isFounding) =
            nft.getIdentity(id);
        assertEq(owner_, alice);
        assertEq(handle, "founder");
        assertEq(tldId, 0);
        assertGt(mintedAt, 0);
        assertTrue(isFounding);
    }

    function test_RevertNameTaken() public {
        vm.prank(alice);
        nft.mint{value: PRICE}("taken", 1);
        vm.prank(bob);
        vm.expectRevert(CultureLayerIdentity.NameTaken.selector);
        nft.mint{value: PRICE}("taken", 1);
    }

    function test_TransferAllowed() public {
        vm.prank(alice);
        nft.mint{value: PRICE}("trade", 2);
        vm.prank(alice);
        nft.transferFrom(alice, bob, 1);
        assertEq(nft.ownerOf(1), bob);
    }

    function test_TokenURIOnchain() public {
        vm.prank(alice);
        nft.mint{value: PRICE}("art", 0);
        string memory uri = nft.tokenURI(1);
        assertTrue(bytes(uri).length > 0);
        assertEq(_substring(uri, 0, 29), "data:application/json;base64,");
    }

    function _substring(string memory str, uint256 start, uint256 len) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(len);
        for (uint256 i = 0; i < len; i++) {
            result[i] = strBytes[start + i];
        }
        return string(result);
    }

    function test_RevertInvalidHandle() public {
        vm.expectRevert(CultureLayerIdentity.InvalidHandle.selector);
        nft.isAvailable("Bad_Handle", 0);
    }

    function test_RevertInsufficientPayment() public {
        vm.prank(alice);
        vm.expectRevert(CultureLayerIdentity.InsufficientPayment.selector);
        nft.mint{value: PRICE - 1}("cheap", 0);
    }
}
