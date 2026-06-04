// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentId} from "../src/AgentId.sol";

contract AgentIdTest is Test {
    AgentId internal agentId;
    address internal owner = address(this);
    address internal alice = address(0xA11CE);

    function setUp() public {
        agentId = new AgentId("BUILDCHAIN Agent ID", "AGENT", "https://example.com/metadata/", owner);
    }

    function testMint() public {
        uint256 tokenId = agentId.mint(alice);
        assertEq(tokenId, 1);
        assertEq(agentId.ownerOf(1), alice);
        assertEq(agentId.tokenURI(1), "https://example.com/metadata/1.json");
    }

    function testOnlyOwnerMint() public {
        vm.prank(alice);
        vm.expectRevert();
        agentId.mint(alice);
    }

    function testSetBaseURI() public {
        agentId.setBaseURI("https://new.example/");
        uint256 tokenId = agentId.mint(alice);
        assertEq(agentId.tokenURI(tokenId), "https://new.example/1.json");
    }

    function testOnlyOwnerSetBaseURI() public {
        vm.prank(alice);
        vm.expectRevert();
        agentId.setBaseURI("https://evil.example/");
    }

    function testTokenURIRequiresMinted() public {
        vm.expectRevert();
        agentId.tokenURI(1);
    }
}
