// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily on-chain attestation for Panic Switch — one round per UTC day per wallet.
/// @dev Stores precision + hold seconds for server-side reward attestation (streak is public; bonus formula is off-chain).
contract PanicSwitchAttestation {
    uint256 public constant MAX_PRECISION = 777;
    uint256 public constant MAX_HOLD_SECONDS = 5220; // ~87 min ceiling (77m endurance + buffer)

    mapping(address => uint256) public lastAttestDay;
    mapping(address => uint256) public streakDays;
    mapping(address => uint256) public totalRuns;
    mapping(address => uint256) public firstAttestAt;

    event PanicAttested(
        address indexed user,
        uint256 dayIndex,
        uint256 precisionScore,
        uint256 holdSeconds,
        uint256 streakDays,
        uint256 totalRuns
    );

    error PanicSwitchAttestation__AlreadyAttestedToday();
    error PanicSwitchAttestation__InvalidPrecision();
    error PanicSwitchAttestation__InvalidHoldSeconds();

    function currentDayIndex() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function canAttestToday(address user) external view returns (bool) {
        return lastAttestDay[user] != currentDayIndex();
    }

    /// @param precisionScore Client-reported precision (0–777); server re-validates against session proof.
    /// @param holdSeconds Visible endurance seconds held (capped on-chain).
    function attest(uint256 precisionScore, uint256 holdSeconds) external {
        uint256 day = currentDayIndex();
        if (lastAttestDay[msg.sender] == day) revert PanicSwitchAttestation__AlreadyAttestedToday();
        if (precisionScore > MAX_PRECISION) revert PanicSwitchAttestation__InvalidPrecision();
        if (holdSeconds > MAX_HOLD_SECONDS) revert PanicSwitchAttestation__InvalidHoldSeconds();

        uint256 prevDay = lastAttestDay[msg.sender];
        if (prevDay > 0 && prevDay == day - 1) {
            streakDays[msg.sender] += 1;
        } else {
            streakDays[msg.sender] = 1;
        }

        if (firstAttestAt[msg.sender] == 0) {
            firstAttestAt[msg.sender] = block.timestamp;
        }

        totalRuns[msg.sender] += 1;
        lastAttestDay[msg.sender] = day;

        emit PanicAttested(
            msg.sender,
            day,
            precisionScore,
            holdSeconds,
            streakDays[msg.sender],
            totalRuns[msg.sender]
        );
    }
}
