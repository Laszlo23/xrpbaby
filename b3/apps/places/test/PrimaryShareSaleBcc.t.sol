// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {PrimaryShareSaleBcc} from "../src/PrimaryShareSaleBcc.sol";
import {IBccUsdOracle} from "../src/bcc/IBccUsdOracle.sol";

contract MockShare is ERC20 {
    constructor() ERC20("Share", "SHR") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockBcc is ERC20 {
    constructor() ERC20("Building Culture Coin", "BCC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockOracle is IBccUsdOracle {
    uint256 public bccWeiPerUsdE6;

    constructor(uint256 rate_) {
        bccWeiPerUsdE6 = rate_;
    }

    function bccAmountForUsd(uint256 usdE6) external view returns (uint256) {
        return (usdE6 * bccWeiPerUsdE6) / 1e6;
    }
}

contract PrimaryShareSaleBccTest is Test {
    MockShare internal share;
    MockBcc internal bcc;
    MockOracle internal oracle;
    PrimaryShareSaleBcc internal sale;

    address internal seller = address(this);
    address internal buyer = address(0xB0B);

    function setUp() public {
        share = new MockShare();
        bcc = new MockBcc();
        oracle = new MockOracle(1e18);
        sale = new PrimaryShareSaleBcc(address(share), address(bcc), address(oracle), seller, 100_000_000);
        share.mint(seller, 100 ether);
        share.approve(address(sale), type(uint256).max);
        bcc.mint(buyer, 1000 ether);
    }

    function test_BuyWithBccDiscount() public {
        uint256 cost = sale.quoteBccCost(2);
        uint256 full = oracle.bccAmountForUsd(200_000_000);
        assertEq(cost, (full * 8889) / 10_000);

        vm.startPrank(buyer);
        bcc.approve(address(sale), cost);
        sale.buyWholeSharesWithBcc(2);
        vm.stopPrank();

        assertEq(share.balanceOf(buyer), 2 ether);
        assertEq(bcc.balanceOf(seller), cost);
    }
}
