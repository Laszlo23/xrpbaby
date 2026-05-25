// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title OgStaking
/// @notice Stake native OG, earn rewards over time, unstake via cooldown (unbonding).
///         Rewards are funded by `notifyRewardAmount` (native OG). Not audited — testnet / demo.
contract OgStaking is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant REWARD_ROLE = keccak256("REWARD_ROLE");

    uint256 public totalStaked;

    mapping(address => uint256) public balanceOf;

    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;
    uint256 public rewardRate;
    uint256 public periodFinish;
    uint256 public constant REWARD_DURATION = 7 days;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 public immutable cooldownPeriod;

    mapping(address => uint256) public pendingWithdraw;
    mapping(address => uint256) public unlockTime;

    event Staked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockTime);
    event UnstakeCompleted(address indexed user, uint256 amount);
    event RewardNotified(uint256 amount, uint256 duration, uint256 rewardRate);

    error ZeroAmount();
    error PendingUnstake();
    error NothingPending();
    error StillLocked();
    error InsufficientStake();

    constructor(address admin, uint256 cooldownPeriod_) {
        if (admin == address(0)) revert();
        cooldownPeriod = cooldownPeriod_;
        lastUpdateTime = block.timestamp;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REWARD_ROLE, admin);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        if (periodFinish == 0) return lastUpdateTime;
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0 || periodFinish == 0 || rewardRate == 0) return rewardPerTokenStored;
        uint256 t = lastTimeRewardApplicable();
        if (t <= lastUpdateTime) return rewardPerTokenStored;
        return rewardPerTokenStored + ((t - lastUpdateTime) * rewardRate * 1e18) / totalStaked;
    }

    function earned(address account) public view returns (uint256) {
        return (balanceOf[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18
            + rewards[account];
    }

    /// @notice Fund rewards and start a new distribution period. Send native OG with the call.
    function notifyRewardAmount(uint256 duration) external payable onlyRole(REWARD_ROLE) updateReward(address(0)) {
        if (duration == 0) duration = REWARD_DURATION;
        if (msg.value == 0) revert ZeroAmount();

        if (block.timestamp >= periodFinish) {
            rewardRate = msg.value / duration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (msg.value + leftover) / duration;
        }

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + duration;
        emit RewardNotified(msg.value, duration, rewardRate);
    }

    function stake() external payable nonReentrant whenNotPaused updateReward(msg.sender) {
        if (msg.value == 0) revert ZeroAmount();
        balanceOf[msg.sender] += msg.value;
        totalStaked += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            (bool ok,) = msg.sender.call{value: reward}("");
            require(ok, "transfer");
            emit RewardPaid(msg.sender, reward);
        }
    }

    /// @notice Request to withdraw staked OG; funds enter cooldown before claim.
    function requestUnstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        if (pendingWithdraw[msg.sender] != 0) revert PendingUnstake();
        if (balanceOf[msg.sender] < amount) revert InsufficientStake();

        balanceOf[msg.sender] -= amount;
        totalStaked -= amount;
        pendingWithdraw[msg.sender] = amount;
        unlockTime[msg.sender] = block.timestamp + cooldownPeriod;
        emit UnstakeRequested(msg.sender, amount, unlockTime[msg.sender]);
    }

    /// @notice Complete withdrawal after cooldown.
    function completeUnstake() external nonReentrant {
        uint256 pending = pendingWithdraw[msg.sender];
        if (pending == 0) revert NothingPending();
        if (block.timestamp < unlockTime[msg.sender]) revert StillLocked();

        pendingWithdraw[msg.sender] = 0;
        unlockTime[msg.sender] = 0;

        (bool ok,) = msg.sender.call{value: pending}("");
        require(ok, "transfer");
        emit UnstakeCompleted(msg.sender, pending);
    }

    receive() external payable {
        revert("use stake()");
    }
}
