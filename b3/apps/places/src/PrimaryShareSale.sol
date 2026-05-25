// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PrimaryShareSale
/// @notice Sells whole property share tokens from a treasury at a fixed native-OG price per 1e18 shares.
///         Enforces minimum **one full share** per purchase (primary / issuer path). Does not affect AMM fractional trades.
/// @dev Treasury must `approve` this contract for share transfers. Treasury and buyer must satisfy
///      `ComplianceRegistry` rules on the share token (e.g. verified wallets, or KYC bypass on testnet).
contract PrimaryShareSale is ReentrancyGuard {
    IERC20 public immutable shareToken;
    address public immutable seller;
    /// @notice Native OG (wei) charged per 1 full share (1e18 token units). Set by admin to match issuance economics.
    uint256 public pricePerShareWei;

    event PriceUpdated(uint256 pricePerShareWei);
    event Purchased(address indexed buyer, uint256 wholeShares, uint256 shareAmount, uint256 paidWei);

    error ZeroAddress();
    error ZeroPrice();
    error MinOneShare();
    error WrongPayment();
    error TransferFailed();

    constructor(address shareToken_, address seller_, uint256 pricePerShareWei_) {
        if (shareToken_ == address(0) || seller_ == address(0)) revert ZeroAddress();
        if (pricePerShareWei_ == 0) revert ZeroPrice();
        shareToken = IERC20(shareToken_);
        seller = seller_;
        pricePerShareWei = pricePerShareWei_;
    }

    /// @notice Admin is the share token admin — grant this contract a small role? We use seller as price setter via separate pattern.
    /// @dev For simplicity, seller is fixed; price updates use optional `setPrice` from seller wallet.
    function setPrice(uint256 newPricePerShareWei) external {
        if (msg.sender != seller) revert();
        if (newPricePerShareWei == 0) revert ZeroPrice();
        pricePerShareWei = newPricePerShareWei;
        emit PriceUpdated(newPricePerShareWei);
    }

    /// @param wholeShares Number of full shares (each 1e18 token units). Must be >= 1.
    function buyWholeShares(uint256 wholeShares) external payable nonReentrant {
        if (wholeShares < 1) revert MinOneShare();
        uint256 shareAmount = wholeShares * 1 ether;
        uint256 cost = wholeShares * pricePerShareWei;
        if (msg.value != cost) revert WrongPayment();

        if (!shareToken.transferFrom(seller, msg.sender, shareAmount)) revert TransferFailed();

        (bool ok,) = seller.call{value: msg.value}("");
        if (!ok) revert TransferFailed();

        emit Purchased(msg.sender, wholeShares, shareAmount, msg.value);
    }
}
