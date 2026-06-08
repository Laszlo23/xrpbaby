// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BuildingCultureTicket} from "../src/BuildingCultureTicket.sol";
import {BuildingCultureHub} from "../src/BuildingCultureHub.sol";

contract BuildingCultureHubTest is Test {
    BuildingCultureTicket tickets;
    BuildingCultureHub hub;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        tickets = new BuildingCultureTicket(address(this));
        hub = new BuildingCultureHub(address(tickets), address(this));
        tickets.setHub(address(hub));
        hub.createEdition("horizon", 0.001 ether, 3, address(this));
    }

    function testMintAndDraw() public {
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);

        vm.prank(alice);
        hub.mintTickets{value: 0.002 ether}(0, 2);

        vm.prank(bob);
        hub.mintTickets{value: 0.001 ether}(0, 1);

        hub.drawWinner(0);

        (, , , uint32 sold, , , bool drawn, address winner,) = hub.getEdition(0);
        assertEq(sold, 3);
        assertTrue(drawn);
        assertTrue(winner == alice || winner == bob);
    }

    function testRevertWhenOverMinting() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(BuildingCultureHub.EditionSoldOut.selector);
        hub.mintTickets{value: 0.004 ether}(0, 4);
    }
}
