// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PrimaryShareSaleERC20
/// @notice Sells whole property share tokens from a treasury at a fixed payment-token price per 1e18 shares.
/// @dev Treasury must approve this contract for share transfers. Buyer pays in `paymentToken` (approve + buy).
contract PrimaryShareSaleERC20 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable shareToken;
    IERC20 public immutable paymentToken;
    address public immutable seller;
    /// @notice Payment token amount per one full share (1e18 share units).
    uint256 public pricePerShare;

    event PriceUpdated(uint256 pricePerShare);
    event Purchased(address indexed buyer, uint256 wholeShares, uint256 shareAmount, uint256 paid);

    error ZeroAddress();
    error ZeroPrice();
    error MinOneShare();
    error WrongPayment();
    error TransferFailed();

    constructor(address shareToken_, address paymentToken_, address seller_, uint256 pricePerShare_) {
        if (shareToken_ == address(0) || paymentToken_ == address(0) || seller_ == address(0)) revert ZeroAddress();
        if (pricePerShare_ == 0) revert ZeroPrice();
        shareToken = IERC20(shareToken_);
        paymentToken = IERC20(paymentToken_);
        seller = seller_;
        pricePerShare = pricePerShare_;
    }

    function setPrice(uint256 newPricePerShare) external {
        if (msg.sender != seller) revert();
        if (newPricePerShare == 0) revert ZeroPrice();
        pricePerShare = newPricePerShare;
        emit PriceUpdated(newPricePerShare);
    }

    /// @param wholeShares Number of full shares (each 1e18 token units). Must be >= 1.
    function buyWholeShares(uint256 wholeShares) external nonReentrant {
        if (wholeShares < 1) revert MinOneShare();
        uint256 shareAmount = wholeShares * 1 ether;
        uint256 cost = wholeShares * pricePerShare;

        paymentToken.safeTransferFrom(msg.sender, seller, cost);

        if (!shareToken.transferFrom(seller, msg.sender, shareAmount)) revert TransferFailed();

        emit Purchased(msg.sender, wholeShares, shareAmount, cost);
    }
}
