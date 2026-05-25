// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IPriceOracle} from "../interfaces/IPriceOracle.sol";

/// @notice Borrow WETH against a single collateral ERC-20 using an IPriceOracle (Chainlink adapter or mock).
contract SimpleLendingPool is ReentrancyGuard {
    IERC20 public immutable COLLATERAL;
    IERC20 public immutable WETH;
    IPriceOracle public immutable ORACLE;

    uint256 public constant LT_BPS = 5000;
    uint256 public constant LIQ_BPS = 6000;

    mapping(address => uint256) public collateralOf;
    mapping(address => uint256) public debtOf;

    error InsufficientCollateral();
    error HealthyPosition();
    error TransferFailed();

    constructor(address collateral_, address weth_, address oracle_) {
        COLLATERAL = IERC20(collateral_);
        WETH = IERC20(weth_);
        ORACLE = IPriceOracle(oracle_);
    }

    function collateralValue(address user) public view returns (uint256) {
        uint256 c = collateralOf[user];
        uint256 p = ORACLE.getPrice(address(COLLATERAL));
        return (c * p) / 1e18;
    }

    function maxBorrow(address user) public view returns (uint256) {
        return (collateralValue(user) * LT_BPS) / 10000;
    }

    function depositCollateral(uint256 amount) external nonReentrant {
        if (!COLLATERAL.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        collateralOf[msg.sender] += amount;
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        uint256 next = collateralOf[msg.sender] - amount;
        collateralOf[msg.sender] = next;
        if (debtOf[msg.sender] > maxBorrowWithCollateral(next)) revert InsufficientCollateral();
        if (!COLLATERAL.transfer(msg.sender, amount)) revert TransferFailed();
    }

    function maxBorrowWithCollateral(uint256 collateralAmount) internal view returns (uint256) {
        uint256 p = ORACLE.getPrice(address(COLLATERAL));
        uint256 cv = (collateralAmount * p) / 1e18;
        return (cv * LT_BPS) / 10000;
    }

    function borrow(uint256 wethAmount) external nonReentrant {
        uint256 newDebt = debtOf[msg.sender] + wethAmount;
        if (newDebt > maxBorrow(msg.sender)) revert InsufficientCollateral();
        debtOf[msg.sender] = newDebt;
        if (!WETH.transfer(msg.sender, wethAmount)) revert TransferFailed();
    }

    function repay(uint256 wethAmount) external nonReentrant {
        if (!WETH.transferFrom(msg.sender, address(this), wethAmount)) revert TransferFailed();
        uint256 d = debtOf[msg.sender];
        debtOf[msg.sender] = d > wethAmount ? d - wethAmount : 0;
    }

    function liquidatable(address user) public view returns (bool) {
        uint256 d = debtOf[user];
        if (d == 0) return false;
        uint256 cv = collateralValue(user);
        return cv * LIQ_BPS < d * 10000;
    }

    /// @notice If position is underwater, liquidator repays `debtAmount` WETH and receives `collateralOut` collateral.
    function liquidate(address user, uint256 debtAmount, uint256 minCollateralOut) external nonReentrant {
        if (!liquidatable(user)) revert HealthyPosition();
        uint256 d = debtOf[user];
        uint256 repayAmt = debtAmount > d ? d : debtAmount;
        if (!WETH.transferFrom(msg.sender, address(this), repayAmt)) revert TransferFailed();
        debtOf[user] = d - repayAmt;

        uint256 collateralSeized = (repayAmt * 1e18) / ORACLE.getPrice(address(COLLATERAL));
        if (collateralSeized > collateralOf[user]) collateralSeized = collateralOf[user];
        if (collateralSeized < minCollateralOut) revert InsufficientCollateral();
        collateralOf[user] -= collateralSeized;
        if (!COLLATERAL.transfer(msg.sender, collateralSeized)) revert TransferFailed();
    }
}
