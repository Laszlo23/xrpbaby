// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockPriceOracle} from "../../src/defi/MockPriceOracle.sol";
import {ChainlinkPriceOracle} from "../../src/defi/ChainlinkPriceOracle.sol";
import {PropertyReserveFeed} from "../../src/reserve/PropertyReserveFeed.sol";
import {PropertyShareDTA} from "../../src/dta/PropertyShareDTA.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockAggregator {
  int256 public answer;
  uint8 public decimals = 8;
  uint256 public updatedAt;

  constructor(int256 answer_) {
    answer = answer_;
    updatedAt = block.timestamp;
  }

  function latestRoundData()
    external
    view
    returns (uint80, int256, uint256, uint256, uint80)
  {
    return (0, answer, 0, updatedAt, 0);
  }
}

contract MockShare is ERC20 {
  constructor() ERC20("Share", "SHR") {}

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}

contract MockPay is ERC20 {
  constructor() ERC20("Pay", "PAY") {}

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}

contract ChainlinkDtaPorTest is Test {
  address internal admin = address(0xA11);
  address internal buyer = address(0xB);

  function test_chainlinkOracle_reads_feed() public {
    MockAggregator agg = new MockAggregator(2_000_000_000_000); // $20000 @ 8 dec ~ scaled
    ChainlinkPriceOracle oracle = new ChainlinkPriceOracle(admin, address(agg));
    uint256 price = oracle.getPrice(address(0x123));
    assertGt(price, 0);
  }

  function test_reserveFeed_caps_mint() public {
    PropertyReserveFeed feed = new PropertyReserveFeed(admin);
    vm.prank(admin);
    feed.setMaxMintableShares(1, 100 ether, bytes32("attest"));
    assertTrue(feed.canMint(1, 50 ether));
    assertFalse(feed.canMint(1, 150 ether));
  }

  function test_dta_subscribe_with_nav() public {
    vm.startPrank(admin);
    MockShare share = new MockShare();
    MockPay pay = new MockPay();
    MockAggregator agg = new MockAggregator(1_000_000_000);
    ChainlinkPriceOracle oracle = new ChainlinkPriceOracle(admin, address(agg));
    oracle.setTokenFeed(address(share), address(agg));
    PropertyReserveFeed feed = new PropertyReserveFeed(admin);
    feed.setMaxMintableShares(1, 1000 ether, bytes32("attest"));

    PropertyShareDTA dta = new PropertyShareDTA(
      address(share), address(pay), admin, address(oracle), address(feed), 1, admin
    );
    feed.grantRole(feed.RECORDER_ROLE(), address(dta));

    share.mint(admin, 100 ether);
    pay.mint(buyer, 1_000_000 ether);
    share.approve(address(dta), type(uint256).max);
    vm.stopPrank();

    vm.prank(buyer);
    pay.approve(address(dta), type(uint256).max);

    vm.prank(buyer);
    dta.subscribe(10);

    assertEq(share.balanceOf(buyer), 10 ether);
  }

  function test_dta_redeem_request() public {
    vm.startPrank(admin);
    MockShare share = new MockShare();
    MockPay pay = new MockPay();
    MockAggregator agg = new MockAggregator(1_000_000_000);
    ChainlinkPriceOracle oracle = new ChainlinkPriceOracle(admin, address(agg));
    oracle.setTokenFeed(address(share), address(agg));
    PropertyReserveFeed feed = new PropertyReserveFeed(admin);

    PropertyShareDTA dta = new PropertyShareDTA(
      address(share), address(pay), admin, address(oracle), address(feed), 1, admin
    );
    share.mint(buyer, 5 ether);
    vm.stopPrank();

    vm.prank(buyer);
    share.approve(address(dta), type(uint256).max);
    vm.prank(buyer);
    uint256 reqId = dta.requestRedeem(2 ether);

    assertEq(reqId, 0);
    assertEq(share.balanceOf(address(dta)), 2 ether);
    assertEq(share.balanceOf(buyer), 3 ether);
  }
}
