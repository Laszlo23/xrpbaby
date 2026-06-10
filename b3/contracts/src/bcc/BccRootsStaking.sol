// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title BccRootsStaking
/// @notice Stake BCC in tiered pools; earn treasury-funded rewards (reward-per-weighted-token).
///         Principal lock per pool tier; unstake uses cooldown unbonding. Not audited — review before mainnet.
contract BccRootsStaking is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant REWARD_ROLE = keccak256("REWARD_ROLE");

    IERC20 public immutable stakingToken;
    uint256 public immutable cooldownPeriod;
    uint256 public immutable poolCount;

    struct PoolConfig {
        string name;
        uint256 lockDuration;
        uint256 weightBps;
        bool active;
    }

    struct PoolState {
        uint256 totalWeightedStaked;
        uint256 rewardPerTokenStored;
        uint256 lastUpdateTime;
        uint256 rewardRate;
        uint256 periodFinish;
    }

    PoolConfig[] private _poolConfigs;
    PoolState[] private _poolStates;
    uint256[] private _totalRawStaked;

    /// @dev Raw BCC staked per user per pool.
    mapping(uint256 poolId => mapping(address user => uint256 balance)) public balanceOf;
    /// @dev Weighted stake checkpoint for reward math.
    mapping(uint256 poolId => mapping(address user => uint256 paid)) public userRewardPerTokenPaid;
    mapping(uint256 poolId => mapping(address user => uint256 amount)) public rewards;
    /// @dev Principal unlock timestamp (extended on additional stake).
    mapping(uint256 poolId => mapping(address user => uint256 unlockAt)) public stakeUnlockAt;
    mapping(uint256 poolId => mapping(address user => uint256 amount)) public pendingWithdraw;
    mapping(uint256 poolId => mapping(address user => uint256 unlockAt)) public unstakeUnlockAt;

    event Staked(uint256 indexed poolId, address indexed user, uint256 amount, uint256 weightedAmount);
    event RewardPaid(uint256 indexed poolId, address indexed user, uint256 reward);
    event UnstakeRequested(uint256 indexed poolId, address indexed user, uint256 amount, uint256 unlockAt);
    event UnstakeCompleted(uint256 indexed poolId, address indexed user, uint256 amount);
    event RewardNotified(uint256 indexed poolId, uint256 amount, uint256 duration, uint256 rewardRate);

    error ZeroAmount();
    error InvalidPool();
    error PoolInactive();
    error PendingUnstake();
    error NothingPending();
    error StillLocked();
    error InsufficientStake();
    error PrincipalLocked();

    constructor(
        address admin,
        IERC20 stakingToken_,
        uint256 cooldownPeriod_,
        string[3] memory names,
        uint256[3] memory lockDurations,
        uint256[3] memory weightBpsList
    ) {
        if (admin == address(0) || address(stakingToken_) == address(0)) revert();
        stakingToken = stakingToken_;
        cooldownPeriod = cooldownPeriod_;
        poolCount = 3;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REWARD_ROLE, admin);

        for (uint256 i = 0; i < 3; i++) {
            if (weightBpsList[i] == 0) revert ZeroAmount();
            _poolConfigs.push(
                PoolConfig({
                    name: names[i],
                    lockDuration: lockDurations[i],
                    weightBps: weightBpsList[i],
                    active: true
                })
            );
            _poolStates.push(
                PoolState({
                    totalWeightedStaked: 0,
                    rewardPerTokenStored: 0,
                    lastUpdateTime: block.timestamp,
                    rewardRate: 0,
                    periodFinish: 0
                })
            );
            _totalRawStaked.push(0);
        }
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function poolConfig(uint256 poolId) external view returns (PoolConfig memory) {
        _requirePool(poolId);
        return _poolConfigs[poolId];
    }

    function poolState(uint256 poolId) external view returns (PoolState memory) {
        _requirePool(poolId);
        return _poolStates[poolId];
    }

    function totalStaked(uint256 poolId) external view returns (uint256 raw, uint256 weighted) {
        _requirePool(poolId);
        return (_totalRawStaked[poolId], _poolStates[poolId].totalWeightedStaked);
    }

    function weightedBalance(uint256 poolId, address account) public view returns (uint256) {
        _requirePool(poolId);
        return _weighted(balanceOf[poolId][account], _poolConfigs[poolId].weightBps);
    }

    function earned(uint256 poolId, address account) public view returns (uint256) {
        _requirePool(poolId);
        uint256 wBal = weightedBalance(poolId, account);
        uint256 rpt = rewardPerToken(poolId);
        return (wBal * (rpt - userRewardPerTokenPaid[poolId][account])) / 1e18 + rewards[poolId][account];
    }

    function rewardPerToken(uint256 poolId) public view returns (uint256) {
        _requirePool(poolId);
        PoolState memory ps = _poolStates[poolId];
        if (ps.totalWeightedStaked == 0 || ps.periodFinish == 0 || ps.rewardRate == 0) {
            return ps.rewardPerTokenStored;
        }
        uint256 t = _lastTimeRewardApplicable(poolId);
        if (t <= ps.lastUpdateTime) return ps.rewardPerTokenStored;
        return ps.rewardPerTokenStored
            + ((t - ps.lastUpdateTime) * ps.rewardRate * 1e18) / ps.totalWeightedStaked;
    }

    /// @notice Fund rewards for a pool. Caller must approve BCC spend beforehand.
    function notifyRewardAmount(uint256 poolId, uint256 amount, uint256 duration)
        external
        onlyRole(REWARD_ROLE)
        updateReward(poolId, address(0))
    {
        _requirePool(poolId);
        if (amount == 0) revert ZeroAmount();
        if (duration == 0) duration = 7 days;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        PoolState storage ps = _poolStates[poolId];
        if (block.timestamp >= ps.periodFinish) {
            ps.rewardRate = amount / duration;
        } else {
            uint256 remaining = ps.periodFinish - block.timestamp;
            uint256 leftover = remaining * ps.rewardRate;
            ps.rewardRate = (amount + leftover) / duration;
        }

        ps.lastUpdateTime = block.timestamp;
        ps.periodFinish = block.timestamp + duration;
        emit RewardNotified(poolId, amount, duration, ps.rewardRate);
    }

    function stake(uint256 poolId, uint256 amount) external nonReentrant whenNotPaused updateReward(poolId, msg.sender) {
        _requireActivePool(poolId);
        if (amount == 0) revert ZeroAmount();

        PoolConfig storage cfg = _poolConfigs[poolId];
        uint256 weighted = _weighted(amount, cfg.weightBps);

        balanceOf[poolId][msg.sender] += amount;
        _totalRawStaked[poolId] += amount;
        _poolStates[poolId].totalWeightedStaked += weighted;

        uint256 newUnlock = block.timestamp + cfg.lockDuration;
        if (stakeUnlockAt[poolId][msg.sender] < newUnlock) {
            stakeUnlockAt[poolId][msg.sender] = newUnlock;
        }

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(poolId, msg.sender, amount, weighted);
    }

    function getReward(uint256 poolId) external nonReentrant updateReward(poolId, msg.sender) {
        _requirePool(poolId);
        uint256 reward = rewards[poolId][msg.sender];
        if (reward > 0) {
            rewards[poolId][msg.sender] = 0;
            stakingToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(poolId, msg.sender, reward);
        }
    }

    function getRewardAll() external nonReentrant {
        for (uint256 i = 0; i < poolCount; i++) {
            _updateReward(i, msg.sender);
            uint256 reward = rewards[i][msg.sender];
            if (reward > 0) {
                rewards[i][msg.sender] = 0;
                stakingToken.safeTransfer(msg.sender, reward);
                emit RewardPaid(i, msg.sender, reward);
            }
        }
    }

    function requestUnstake(uint256 poolId, uint256 amount)
        external
        nonReentrant
        updateReward(poolId, msg.sender)
    {
        _requirePool(poolId);
        if (amount == 0) revert ZeroAmount();
        if (pendingWithdraw[poolId][msg.sender] != 0) revert PendingUnstake();
        if (balanceOf[poolId][msg.sender] < amount) revert InsufficientStake();
        if (block.timestamp < stakeUnlockAt[poolId][msg.sender]) revert PrincipalLocked();

        uint256 weighted = _weighted(amount, _poolConfigs[poolId].weightBps);
        balanceOf[poolId][msg.sender] -= amount;
        _totalRawStaked[poolId] -= amount;
        _poolStates[poolId].totalWeightedStaked -= weighted;

        pendingWithdraw[poolId][msg.sender] = amount;
        unstakeUnlockAt[poolId][msg.sender] = block.timestamp + cooldownPeriod;
        emit UnstakeRequested(poolId, msg.sender, amount, unstakeUnlockAt[poolId][msg.sender]);
    }

    function completeUnstake(uint256 poolId) external nonReentrant {
        _requirePool(poolId);
        uint256 pending = pendingWithdraw[poolId][msg.sender];
        if (pending == 0) revert NothingPending();
        if (block.timestamp < unstakeUnlockAt[poolId][msg.sender]) revert StillLocked();

        pendingWithdraw[poolId][msg.sender] = 0;
        unstakeUnlockAt[poolId][msg.sender] = 0;

        stakingToken.safeTransfer(msg.sender, pending);
        emit UnstakeCompleted(poolId, msg.sender, pending);
    }

    modifier updateReward(uint256 poolId, address account) {
        _updateReward(poolId, account);
        _;
    }

    function _updateReward(uint256 poolId, address account) internal {
        _requirePool(poolId);
        PoolState storage ps = _poolStates[poolId];
        ps.rewardPerTokenStored = rewardPerToken(poolId);
        ps.lastUpdateTime = _lastTimeRewardApplicable(poolId);
        if (account != address(0)) {
            rewards[poolId][account] = earned(poolId, account);
            userRewardPerTokenPaid[poolId][account] = ps.rewardPerTokenStored;
        }
    }

    function _lastTimeRewardApplicable(uint256 poolId) internal view returns (uint256) {
        PoolState memory ps = _poolStates[poolId];
        if (ps.periodFinish == 0) return ps.lastUpdateTime;
        return block.timestamp < ps.periodFinish ? block.timestamp : ps.periodFinish;
    }

    function _weighted(uint256 amount, uint256 weightBps) internal pure returns (uint256) {
        return (amount * weightBps) / 10_000;
    }

    function _requirePool(uint256 poolId) internal view {
        if (poolId >= poolCount) revert InvalidPool();
    }

    function _requireActivePool(uint256 poolId) internal view {
        _requirePool(poolId);
        if (!_poolConfigs[poolId].active) revert PoolInactive();
    }
}
