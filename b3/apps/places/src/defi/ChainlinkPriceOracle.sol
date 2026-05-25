// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {AggregatorV3Interface} from "../chainlink/AggregatorV3Interface.sol";
import {IPriceOracle} from "../interfaces/IPriceOracle.sol";

/// @notice Production oracle: Chainlink AggregatorV3 per token + optional ETH/USD reference feed.
contract ChainlinkPriceOracle is AccessControl, IPriceOracle {
  bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");

  /// @notice WETH per 1e18 share token when no per-token feed is set (uses ethUsdFeed only — demo path).
  AggregatorV3Interface public ethUsdFeed;

  mapping(address token => address feed) public tokenFeedOf;

  /// @notice Staleness guard (seconds). 0 = disabled.
  uint256 public maxStaleness;

  event EthUsdFeedUpdated(address indexed feed);
  event TokenFeedUpdated(address indexed token, address indexed feed);
  event MaxStalenessUpdated(uint256 seconds_);

  error StaleFeed();
  error InvalidPrice();

  constructor(address admin, address ethUsdFeed_) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(ORACLE_ADMIN_ROLE, admin);
    if (ethUsdFeed_ != address(0)) {
      ethUsdFeed = AggregatorV3Interface(ethUsdFeed_);
      emit EthUsdFeedUpdated(ethUsdFeed_);
    }
  }

  function setEthUsdFeed(address feed) external onlyRole(ORACLE_ADMIN_ROLE) {
    ethUsdFeed = AggregatorV3Interface(feed);
    emit EthUsdFeedUpdated(feed);
  }

  function setTokenFeed(address token, address feed) external onlyRole(ORACLE_ADMIN_ROLE) {
    tokenFeedOf[token] = feed;
    emit TokenFeedUpdated(token, feed);
  }

  function setMaxStaleness(uint256 seconds_) external onlyRole(ORACLE_ADMIN_ROLE) {
    maxStaleness = seconds_;
    emit MaxStalenessUpdated(seconds_);
  }

  /// @inheritdoc IPriceOracle
  /// @dev Per-token feed returns price in WETH per 1e18 token (configure feed decimals off-chain).
  /// When only ethUsdFeed is set, returns ETH/USD scaled to 1e18 for legacy lending demos.
  function getPrice(address token) external view returns (uint256 priceE18) {
    address tf = tokenFeedOf[token];
    if (tf != address(0)) {
      return _readFeed(AggregatorV3Interface(tf));
    }
    if (address(ethUsdFeed) == address(0)) return 0;
    return _readFeed(ethUsdFeed);
  }

  function _readFeed(AggregatorV3Interface feed) internal view returns (uint256) {
    (, int256 answer,, uint256 updatedAt,) = feed.latestRoundData();
    if (answer <= 0) revert InvalidPrice();
    if (maxStaleness != 0 && block.timestamp - updatedAt > maxStaleness) revert StaleFeed();
    uint8 dec = feed.decimals();
    if (dec == 18) return uint256(answer);
    if (dec < 18) return uint256(answer) * (10 ** (18 - dec));
    return uint256(answer) / (10 ** (dec - 18));
  }
}
