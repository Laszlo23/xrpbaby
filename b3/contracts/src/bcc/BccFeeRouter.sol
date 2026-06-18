// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BccFeeRouter
/// @notice Splits incoming BCC into treasury, burn, and ecosystem growth buckets.
contract BccFeeRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable bcc;
    address public immutable treasury;
    address public immutable burnAddress;
    address public immutable ecosystem;

    uint256 public treasuryBps = 3_333;
    uint256 public burnBps = 3_333;
    uint256 public ecosystemBps = 3_334;

    event Routed(address indexed payer, uint256 total, uint256 toTreasury, uint256 toBurn, uint256 toEcosystem);
    event SplitUpdated(uint256 treasuryBps, uint256 burnBps, uint256 ecosystemBps);

    constructor(address initialOwner, address bcc_, address treasury_, address burnAddress_, address ecosystem_) Ownable(initialOwner) {
        require(bcc_ != address(0), "zero bcc");
        require(treasury_ != address(0) && burnAddress_ != address(0) && ecosystem_ != address(0), "zero addr");
        bcc = IERC20(bcc_);
        treasury = treasury_;
        burnAddress = burnAddress_;
        ecosystem = ecosystem_;
    }

    function setSplit(uint256 treasuryBps_, uint256 burnBps_, uint256 ecosystemBps_) external onlyOwner {
        require(treasuryBps_ + burnBps_ + ecosystemBps_ == 10_000, "sum");
        treasuryBps = treasuryBps_;
        burnBps = burnBps_;
        ecosystemBps = ecosystemBps_;
        emit SplitUpdated(treasuryBps_, burnBps_, ecosystemBps_);
    }

    function route(uint256 amount) external nonReentrant {
        require(amount > 0, "zero");
        bcc.safeTransferFrom(msg.sender, address(this), amount);

        uint256 toTreasury = (amount * treasuryBps) / 10_000;
        uint256 toBurn = (amount * burnBps) / 10_000;
        uint256 toEco = amount - toTreasury - toBurn;

        if (toTreasury > 0) bcc.safeTransfer(treasury, toTreasury);
        if (toBurn > 0) bcc.safeTransfer(burnAddress, toBurn);
        if (toEco > 0) bcc.safeTransfer(ecosystem, toEco);

        emit Routed(msg.sender, amount, toTreasury, toBurn, toEco);
    }
}
