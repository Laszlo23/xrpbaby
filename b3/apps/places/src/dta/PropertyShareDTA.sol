// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IPriceOracle} from "../interfaces/IPriceOracle.sol";
import {IPropertyReserveFeed} from "../interfaces/IPropertyReserveFeed.sol";

/// @title PropertyShareDTA
/// @notice DTA-shaped subscribe (NAV-priced) and redeem request queue for REOC profile D.
contract PropertyShareDTA is ReentrancyGuard, AccessControl {
  using SafeERC20 for IERC20;

  bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

  IERC20 public immutable shareToken;
  IERC20 public immutable paymentToken;
  address public immutable treasury;
  IPriceOracle public navOracle;
  IPropertyReserveFeed public reserveFeed;
  uint256 public immutable propertyId;

  struct RedeemRequest {
    address owner;
    uint256 shareAmount;
    uint256 requestedAt;
    bool fulfilled;
  }

  RedeemRequest[] public redeemQueue;

  event Subscribed(address indexed buyer, uint256 wholeShares, uint256 shareAmount, uint256 paid, uint256 navPrice);
  event RedeemRequested(uint256 indexed requestId, address indexed owner, uint256 shareAmount);
  event RedeemFulfilled(uint256 indexed requestId, address indexed owner, uint256 shareAmount, uint256 paid);
  event NavOracleUpdated(address indexed oracle);
  event ReserveFeedUpdated(address indexed feed);

  error ZeroAddress();
  error ZeroAmount();
  error ZeroNav();
  error ExceedsReserve();
  error TransferFailed();

  constructor(
    address shareToken_,
    address paymentToken_,
    address treasury_,
    address navOracle_,
    address reserveFeed_,
    uint256 propertyId_,
    address admin_
  ) {
    if (shareToken_ == address(0) || paymentToken_ == address(0) || treasury_ == address(0) || admin_ == address(0)) {
      revert ZeroAddress();
    }
    shareToken = IERC20(shareToken_);
    paymentToken = IERC20(paymentToken_);
    treasury = treasury_;
    if (navOracle_ != address(0)) navOracle = IPriceOracle(navOracle_);
    if (reserveFeed_ != address(0)) reserveFeed = IPropertyReserveFeed(reserveFeed_);
    propertyId = propertyId_;
    _grantRole(DEFAULT_ADMIN_ROLE, admin_);
    _grantRole(ISSUER_ROLE, admin_);
  }

  function setNavOracle(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
    navOracle = IPriceOracle(oracle);
    emit NavOracleUpdated(oracle);
  }

  function setReserveFeed(address feed) external onlyRole(DEFAULT_ADMIN_ROLE) {
    reserveFeed = IPropertyReserveFeed(feed);
    emit ReserveFeedUpdated(feed);
  }

  /// @notice NAV-priced subscription. Treasury must approve share transfers to this contract.
  function subscribe(uint256 wholeShares) external nonReentrant {
    if (wholeShares < 1) revert ZeroAmount();
    uint256 shareAmount = wholeShares * 1 ether;

    if (address(reserveFeed) != address(0) && !reserveFeed.canMint(propertyId, shareAmount)) {
      revert ExceedsReserve();
    }

    uint256 navPrice = address(navOracle) != address(0) ? navOracle.getPrice(address(shareToken)) : 0;
    if (navPrice == 0) revert ZeroNav();
    uint256 cost = wholeShares * navPrice;

    paymentToken.safeTransferFrom(msg.sender, treasury, cost);
    if (!shareToken.transferFrom(treasury, msg.sender, shareAmount)) revert TransferFailed();

    if (address(reserveFeed) != address(0)) {
      reserveFeed.recordMint(propertyId, shareAmount);
    }

    emit Subscribed(msg.sender, wholeShares, shareAmount, cost, navPrice);
  }

  function requestRedeem(uint256 shareAmount) external nonReentrant returns (uint256 requestId) {
    if (shareAmount == 0) revert ZeroAmount();
    shareToken.safeTransferFrom(msg.sender, address(this), shareAmount);
    requestId = redeemQueue.length;
    redeemQueue.push(
      RedeemRequest({owner: msg.sender, shareAmount: shareAmount, requestedAt: block.timestamp, fulfilled: false})
    );
    emit RedeemRequested(requestId, msg.sender, shareAmount);
  }

  function fulfillRedeem(uint256 requestId, uint256 paymentAmount) external nonReentrant onlyRole(ISSUER_ROLE) {
    RedeemRequest storage req = redeemQueue[requestId];
    require(!req.fulfilled, "fulfilled");
    req.fulfilled = true;
    shareToken.safeTransfer(msg.sender, req.shareAmount);
    paymentToken.safeTransferFrom(msg.sender, req.owner, paymentAmount);
    emit RedeemFulfilled(requestId, req.owner, req.shareAmount, paymentAmount);
  }
}
