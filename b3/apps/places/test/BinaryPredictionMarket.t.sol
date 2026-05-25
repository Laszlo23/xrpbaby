// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {BinaryPredictionMarket} from "../src/defi/BinaryPredictionMarket.sol";

contract StakeTok is ERC20 {
    constructor() ERC20("ST", "ST") {
        _mint(msg.sender, 1_000_000 ether);
    }
}

contract BinaryPredictionMarketTest is Test {
    BinaryPredictionMarket internal m;
    StakeTok internal stake;
    address internal admin = address(0xA11);

    function setUp() public {
        m = new BinaryPredictionMarket(admin);
        stake = new StakeTok();
    }

    function testResolveAndClaim() public {
        vm.prank(admin);
        uint256 id = m.createMarket("Price up?", block.timestamp + 1 days, address(stake));

        address alice = address(0xA11CE);
        address bob = address(0xB0B);
        stake.transfer(alice, 1000 ether);
        stake.transfer(bob, 1000 ether);

        vm.startPrank(alice);
        stake.approve(address(m), type(uint256).max);
        m.stakeYes(id, 100 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        stake.approve(address(m), type(uint256).max);
        m.stakeNo(id, 100 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 2 days);
        vm.prank(admin);
        m.resolve(id, true);

        uint256 before = stake.balanceOf(alice);
        vm.prank(alice);
        m.claim(id);
        assertGt(stake.balanceOf(alice), before);
    }
}
