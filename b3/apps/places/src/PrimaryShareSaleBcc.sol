// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IBccUsdOracle} from "./bcc/IBccUsdOracle.sol";

/// @title PrimaryShareSaleBcc — buy property shares paying BCC at 11.11% discount vs USDC list price.
contract PrimaryShareSaleBcc is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable shareToken;
    IERC20 public immutable bccToken;
    IBccUsdOracle public immutable bccOracle;
    address public immutable seller;
    /// @notice USDC (6 decimals) price per one full share (1e18 share units).
    uint256 public pricePerShareUsdc;
    uint256 public constant BCC_DISCOUNT_BPS = 1111;

    event PriceUpdated(uint256 pricePerShareUsdc);
    event PurchasedWithBcc(address indexed buyer, uint256 wholeShares, uint256 shareAmount, uint256 bccPaid);

    error ZeroAddress();
    error ZeroPrice();
    error MinOneShare();
    error TransferFailed();

    constructor(
        address shareToken_,
        address bccToken_,
        address bccOracle_,
        address seller_,
        uint256 pricePerShareUsdc_
    ) {
        if (shareToken_ == address(0) || bccToken_ == address(0) || bccOracle_ == address(0) || seller_ == address(0)) {
            revert ZeroAddress();
        }
        if (pricePerShareUsdc_ == 0) revert ZeroPrice();
        shareToken = IERC20(shareToken_);
        bccToken = IERC20(bccToken_);
        bccOracle = IBccUsdOracle(bccOracle_);
        seller = seller_;
        pricePerShareUsdc = pricePerShareUsdc_;
    }

    function setPrice(uint256 newPricePerShareUsdc) external {
        if (msg.sender != seller) revert();
        if (newPricePerShareUsdc == 0) revert ZeroPrice();
        pricePerShareUsdc = newPricePerShareUsdc;
        emit PriceUpdated(newPricePerShareUsdc);
    }

    function quoteBccCost(uint256 wholeShares) external view returns (uint256 bccCost) {
        uint256 usdE6 = wholeShares * pricePerShareUsdc;
        uint256 full = bccOracle.bccAmountForUsd(usdE6);
        bccCost = (full * (10_000 - BCC_DISCOUNT_BPS)) / 10_000;
    }

    function buyWholeSharesWithBcc(uint256 wholeShares) external nonReentrant {
        if (wholeShares < 1) revert MinOneShare();
        uint256 shareAmount = wholeShares * 1 ether;
        uint256 bccCost = this.quoteBccCost(wholeShares);
        bccToken.safeTransferFrom(msg.sender, seller, bccCost);
        if (!shareToken.transferFrom(seller, msg.sender, shareAmount)) revert TransferFailed();
        emit PurchasedWithBcc(msg.sender, wholeShares, shareAmount, bccCost);
    }
}
