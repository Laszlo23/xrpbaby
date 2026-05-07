// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {RaffleTicketCampaign} from "../src/RaffleTicketCampaign.sol";

contract RaffleTicketCampaignTest is Test {
    RaffleTicketCampaign public campaign;
    address public owner = address(0xA11CE);
    address public treasury = address(0xBEEF);
    address public alice = address(0xA11CE2);

    uint256 constant PRICE = 0.01 ether;
    uint256 constant MAX = 100;

    function setUp() public {
        vm.prank(owner);
        campaign = new RaffleTicketCampaign(
            "BUILDCHAIN Ticket",
            "BCTIX",
            PRICE,
            MAX,
            treasury,
            "https://example.com/meta/",
            owner
        );
        vm.deal(alice, 100 ether);
    }

    function testMint_forwards_eth_to_treasury() public {
        uint256 balBefore = treasury.balance;
        vm.prank(alice);
        campaign.mint{value: PRICE * 2}(2);
        assertEq(treasury.balance - balBefore, PRICE * 2);
        assertEq(campaign.balanceOf(alice), 2);
        assertEq(campaign.totalSupply(), 2);
    }

    function testRevert_wrong_payment() public {
        vm.prank(alice);
        vm.expectRevert(bytes("payment"));
        campaign.mint{value: PRICE - 1}(1);
    }

    function test_close_commit_reveal_winner_in_set() public {
        vm.prank(alice);
        campaign.mint{value: PRICE * 5}(5);

        bytes32 secret = bytes32(uint256(777));
        bytes32 commitment = keccak256(abi.encodePacked(secret));

        vm.prank(owner);
        campaign.close();

        vm.prank(owner);
        campaign.commitDraw(commitment);

        uint256 eb = campaign.entropyBlock();
        vm.roll(eb + 1);

        vm.prank(owner);
        campaign.revealDraw(secret);

        assertEq(uint256(campaign.phase()), uint256(RaffleTicketCampaign.Phase.Drawn));
        uint256 wid = campaign.winningTokenId();
        assertTrue(wid >= 1 && wid <= 5);
        assertEq(campaign.ownerOf(wid), alice);
    }

    function test_cannot_mint_after_close() public {
        vm.prank(alice);
        campaign.mint{value: PRICE}(1);

        vm.prank(owner);
        campaign.close();

        vm.prank(alice);
        vm.expectRevert(bytes("not active"));
        campaign.mint{value: PRICE}(1);
    }
}
