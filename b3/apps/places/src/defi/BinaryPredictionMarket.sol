// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Binary YES/NO market with admin resolution (testnet).
contract BinaryPredictionMarket is AccessControl, ReentrancyGuard {
    struct Market {
        string question;
        uint256 endTime;
        IERC20 stakeToken;
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool outcomeYes;
    }

    uint256 public nextMarketId = 1;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public yesStake;
    mapping(uint256 => mapping(address => uint256)) public noStake;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event MarketCreated(uint256 indexed id, string question, uint256 endTime, address stakeToken);
    event Staked(uint256 indexed id, address indexed user, bool yes, uint256 amount);
    event Resolved(uint256 indexed id, bool outcomeYes);
    event Claimed(uint256 indexed id, address indexed user, uint256 payout);

    error BadState();
    error TooLate();
    error ZeroStake();

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function createMarket(string calldata question, uint256 endTime, address stakeToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (uint256 id)
    {
        id = nextMarketId++;
        markets[id] = Market({
            question: question,
            endTime: endTime,
            stakeToken: IERC20(stakeToken),
            yesPool: 0,
            noPool: 0,
            resolved: false,
            outcomeYes: false
        });
        emit MarketCreated(id, question, endTime, stakeToken);
    }

    function stakeYes(uint256 id, uint256 amount) external nonReentrant {
        Market storage m = markets[id];
        if (m.endTime == 0) revert BadState();
        if (block.timestamp > m.endTime) revert TooLate();
        if (!m.stakeToken.transferFrom(msg.sender, address(this), amount)) revert BadState();
        yesStake[id][msg.sender] += amount;
        m.yesPool += amount;
        emit Staked(id, msg.sender, true, amount);
    }

    function stakeNo(uint256 id, uint256 amount) external nonReentrant {
        Market storage m = markets[id];
        if (m.endTime == 0) revert BadState();
        if (block.timestamp > m.endTime) revert TooLate();
        if (!m.stakeToken.transferFrom(msg.sender, address(this), amount)) revert BadState();
        noStake[id][msg.sender] += amount;
        m.noPool += amount;
        emit Staked(id, msg.sender, false, amount);
    }

    function resolve(uint256 id, bool outcomeYes_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Market storage m = markets[id];
        if (m.endTime == 0 || m.resolved) revert BadState();
        if (block.timestamp < m.endTime) revert BadState();
        m.resolved = true;
        m.outcomeYes = outcomeYes_;
        emit Resolved(id, outcomeYes_);
    }

    function claim(uint256 id) external nonReentrant {
        Market storage m = markets[id];
        if (!m.resolved) revert BadState();
        if (claimed[id][msg.sender]) revert BadState();

        uint256 userStake = m.outcomeYes ? yesStake[id][msg.sender] : noStake[id][msg.sender];
        if (userStake == 0) revert ZeroStake();

        uint256 winPool = m.outcomeYes ? m.yesPool : m.noPool;
        uint256 total = m.yesPool + m.noPool;
        uint256 payout = (userStake * total) / winPool;

        claimed[id][msg.sender] = true;
        if (!m.stakeToken.transfer(msg.sender, payout)) revert BadState();
        emit Claimed(id, msg.sender, payout);
    }
}
